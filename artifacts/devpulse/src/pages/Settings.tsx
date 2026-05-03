import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useGetPreferences, 
  useUpdatePreferences, 
  useGetGithubRepos,
  useTestSlackWebhook,
  PreferencesStandupTone,
  UpdatePreferencesBody
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, MessageSquare, Github, Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Settings() {
  const { toast } = useToast();
  const { data: prefs, isLoading: isLoadingPrefs } = useGetPreferences({});
  const { data: repos, isLoading: isLoadingRepos } = useGetGithubRepos({});
  
  const updateMutation = useUpdatePreferences();
  const testSlackMutation = useTestSlackWebhook();

  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [standupTone, setStandupTone] = useState<PreferencesStandupTone>("professional");
  const [defaultRepo, setDefaultRepo] = useState("");

  useEffect(() => {
    if (prefs) {
      setSlackWebhookUrl(prefs.slackWebhookUrl || "");
      setStandupTone(prefs.standupTone || "professional");
      setDefaultRepo(prefs.defaultRepo || "");
    }
  }, [prefs]);

  const handleSave = () => {
    const data: UpdatePreferencesBody = {
      standupTone,
    };
    
    if (slackWebhookUrl) data.slackWebhookUrl = slackWebhookUrl;
    else data.slackWebhookUrl = null;
    
    if (defaultRepo && defaultRepo !== "none") data.defaultRepo = defaultRepo;
    else data.defaultRepo = null;

    updateMutation.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated successfully.",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Failed to save",
          description: err?.error || "An error occurred while saving preferences.",
          variant: "destructive",
        });
      }
    });
  };

  const handleTestSlack = () => {
    if (!slackWebhookUrl) {
      toast({
        title: "Missing webhook URL",
        description: "Please enter a Slack webhook URL to test.",
        variant: "destructive",
      });
      return;
    }

    testSlackMutation.mutate({ data: { webhookUrl: slackWebhookUrl } }, {
      onSuccess: () => {
        toast({
          title: "Test successful",
          description: "A test message was sent to your Slack channel.",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Test failed",
          description: err?.error || "Could not send test message to Slack.",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoadingPrefs) {
    return (
      <AppLayout requireAuth>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requireAuth>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your standup generation and integrations.</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Slack Integration</CardTitle>
            </div>
            <CardDescription>
              Connect to Slack to automatically post your generated standups.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Incoming Webhook URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="webhook-url" 
                  type="password"
                  placeholder="https://hooks.slack.com/services/..." 
                  value={slackWebhookUrl}
                  onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  className="bg-background"
                />
                <Button 
                  variant="secondary" 
                  onClick={handleTestSlack}
                  disabled={!slackWebhookUrl || testSlackMutation.isPending}
                >
                  {testSlackMutation.isPending ? "Testing..." : "Test"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Create an Incoming Webhook in your Slack workspace settings and paste the URL here.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <CardTitle>Generation Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize how your AI standups are written and formatted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Standup Tone</Label>
              <RadioGroup 
                value={standupTone} 
                onValueChange={(val) => setStandupTone(val as PreferencesStandupTone)}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center space-x-2 border p-3 rounded-md bg-background/50 cursor-pointer hover:bg-secondary/20">
                  <RadioGroupItem value="professional" id="r1" />
                  <Label htmlFor="r1" className="flex-1 cursor-pointer">
                    <div className="font-medium">Professional</div>
                    <div className="text-xs text-muted-foreground font-normal">Clear, concise, and business-appropriate sentences.</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md bg-background/50 cursor-pointer hover:bg-secondary/20">
                  <RadioGroupItem value="casual" id="r2" />
                  <Label htmlFor="r2" className="flex-1 cursor-pointer">
                    <div className="font-medium">Casual</div>
                    <div className="text-xs text-muted-foreground font-normal">Relaxed tone, suitable for close-knit startup teams.</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md bg-background/50 cursor-pointer hover:bg-secondary/20">
                  <RadioGroupItem value="bullet-points" id="r3" />
                  <Label htmlFor="r3" className="flex-1 cursor-pointer">
                    <div className="font-medium">Bullet Points</div>
                    <div className="text-xs text-muted-foreground font-normal">Strictly bulleted lists for maximum scannability.</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator className="bg-border/50" />

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Github className="h-4 w-4" />
                <Label htmlFor="default-repo">Default Repository</Label>
              </div>
              <Select value={defaultRepo || "none"} onValueChange={setDefaultRepo}>
                <SelectTrigger id="default-repo" className="bg-background">
                  <SelectValue placeholder="Select a default repository" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Select manually)</SelectItem>
                  {repos?.map(repo => (
                    <SelectItem key={repo.id} value={repo.fullName}>{repo.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This repository will be selected automatically on the Dashboard.
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t pt-4">
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground ml-auto w-full md:w-auto"
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
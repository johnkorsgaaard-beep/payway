"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Send, Mail, KeyRound, Check } from "lucide-react";

interface Template {
  type: string;
  subject: string;
  body: string;
}

const TYPE_LABELS: Record<string, { label: string; icon: typeof Mail }> = {
  welcome: { label: "Velkomst-email", icon: Mail },
  password_reset: { label: "Nulstil adgangskode", icon: KeyRound },
};

export default function EmailsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<string>("welcome");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/emails")
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data.templates);
        const t = data.templates.find((t: Template) => t.type === "welcome");
        if (t) {
          setSubject(t.subject);
          setBody(t.body);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectTemplate = (type: string) => {
    setSelected(type);
    const t = templates.find((t) => t.type === type);
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
    setPreview(false);
    setSaved(false);
    setSendResult(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/emails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selected, subject, body }),
      });
      if (res.ok) {
        setSaved(true);
        setTemplates((prev) =>
          prev.map((t) => (t.type === selected ? { ...t, subject, body } : t))
        );
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!testEmail.includes("@")) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          templateType: selected,
          variables: { name: "Test Bruger", reset_link: "https://payway.fo/reset?token=test123" },
        }),
      });
      const data = await res.json();
      setSendResult(res.ok ? "Email sendt!" : data.message || "Fejl ved afsendelse");
    } catch {
      setSendResult("Netværksfejl");
    } finally {
      setSending(false);
    }
  };

  const previewHtml = body
    .replaceAll("{{name}}", "John Doe")
    .replaceAll("{{reset_link}}", "https://payway.fo/reset?token=abc123");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#2ec964] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a2f5b]">Email-skabeloner</h1>
        <p className="text-[#0a2f5b]/40">Rediger emails der sendes til brugere</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Template list */}
        <div className="col-span-3">
          <Card>
            <CardContent className="p-3">
              <div className="space-y-1">
                {templates.map((t) => {
                  const config = TYPE_LABELS[t.type] || { label: t.type, icon: Mail };
                  const Icon = config.icon;
                  return (
                    <button
                      key={t.type}
                      onClick={() => selectTemplate(t.type)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all ${
                        selected === t.type
                          ? "bg-[#2ec964]/10 text-[#2ec964]"
                          : "text-[#0a2f5b]/60 hover:bg-[#0a2f5b]/[0.03]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Test send */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Send test-email</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="email"
                placeholder="din@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mb-3 w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-3 py-2 text-sm text-[#0a2f5b] placeholder-[#0a2f5b]/25 focus:border-[#2ec964]/30 focus:outline-none"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestSend}
                disabled={sending || !testEmail.includes("@")}
                className="w-full"
              >
                <Send className="mr-2 h-3.5 w-3.5" />
                {sending ? "Sender..." : "Send test"}
              </Button>
              {sendResult && (
                <p className={`mt-2 text-xs ${sendResult.includes("sendt") ? "text-green-600" : "text-red-500"}`}>
                  {sendResult}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>{TYPE_LABELS[selected]?.label || selected}</CardTitle>
                  <Badge variant="info">
                    {"{{name}}"} {"{{reset_link}}"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPreview(!preview)}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    {preview ? "Rediger" : "Forhåndsvisning"}
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saved ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Gemt
                      </>
                    ) : (
                      <>
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        {saving ? "Gemmer..." : "Gem"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#0a2f5b]/[0.08] bg-gray-50 p-4">
                    <p className="text-xs font-medium text-[#0a2f5b]/40 mb-1">Emne:</p>
                    <p className="text-sm font-semibold text-[#0a2f5b]">
                      {subject.replaceAll("{{name}}", "John Doe")}
                    </p>
                  </div>
                  <div
                    className="rounded-xl border border-[#0a2f5b]/[0.08] bg-white p-6"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#0a2f5b]/50">
                      Emne
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-4 py-2.5 text-sm text-[#0a2f5b] focus:border-[#2ec964]/30 focus:outline-none focus:ring-1 focus:ring-[#2ec964]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#0a2f5b]/50">
                      HTML-indhold
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={20}
                      className="w-full rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-4 py-3 font-mono text-xs text-[#0a2f5b] focus:border-[#2ec964]/30 focus:outline-none focus:ring-1 focus:ring-[#2ec964]/10"
                    />
                  </div>
                  <p className="text-xs text-[#0a2f5b]/30">
                    Brug {"{{name}}"} for brugerens navn og {"{{reset_link}}"} for nulstillingslink.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* global React, ReactDOM, Field, Input, Textarea, Button, Card, Icon, Avatar, Kbd, fmtPLN, parsePLN, fmtHours, TaskRow, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle */
const { useState, useMemo, useEffect, useRef } = React;

// =============================================================
// PDF preview — A4 sheet that mirrors form state
// =============================================================
const PdfPreview = ({ data, summary, currency }) => {
  const tasks = data.tasks.filter(t => t.id || t.description || t.hours);
  const formatDate = (iso) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}`;
  };
  const formatLong = (iso) => {
    if (!iso) return "—";
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const [y, m, d] = iso.split("-");
    return `${months[Number(m)-1]} ${Number(d)}, ${y}`;
  };
  return (
    <div className="mx-auto bg-white shadow-xl ring-1 ring-slate-200 origin-top w-[420px] min-h-[594px] px-10 py-9 text-slate-900">
      {/* Header — email + name */}
      <div className="flex items-start justify-between text-[9px] text-slate-700 mb-4">
        <span className="break-all">{data.email || "—"}</span>
        <span className="font-medium">{data.fullName || "—"}</span>
      </div>

      {/* Act intro */}
      <div className="text-[10px] text-slate-700 mb-4 leading-snug">
        <span className="font-bold text-slate-900">Act #{data.actNumber || "—"}</span>{" "}
        for services rendered under the B2B service agreement from {formatLong(data.agreementDate)}
      </div>

      {/* Title block */}
      <h1 className="text-[15px] font-bold text-slate-900 mb-2">Acceptance Act</h1>
      <div className="flex items-baseline gap-3 text-[10px] mb-4">
        <span className="font-bold text-slate-900">Submitted on:</span>
        <span className="font-semibold text-slate-900 tabular-nums">{formatDate(data.actDate)}</span>
      </div>

      {/* Legal preamble */}
      <p className="text-[9px] text-slate-700 leading-relaxed mb-3">
        We, the undersigned, Representative of the Client, and the Representative of the Executor, hereby
        execute this Acceptance Act confirming that the Executor rendered the following services calculated
        on an hourly basis in accordance with the B2B service agreement.
      </p>
      <p className="text-[9px] text-slate-700 leading-relaxed mb-1.5">
        The services were rendered on due and timely basis. The Parties have no further claims against each other.
      </p>

      {/* Hourly rate */}
      <div className="flex flex-col items-baseline gap-3 text-[9px] text-slate-700 mb-5">
        <span>Executor's hourly rate:</span>
        <span className="font-bold text-slate-900 tabular-nums">{fmtPLN(parsePLN(data.pricePerHour))} {currency}</span>
        <span className="text-slate-700">net per hour + VAT, as defined in the B2B service agreement.</span>
      </div>

      {/* Services table */}
      <div className="flex items-start justify-between mb-1.5">
        <h2 className="text-[10.5px] font-bold text-slate-900">Description of services</h2>
        <span className="text-[10.5px] font-bold text-slate-900">Number of hours</span>
      </div>
      <div className="border-t border-slate-300">
        {tasks.length === 0 ? (
          <div className="py-4 text-center text-slate-400 italic text-[9px]">No tasks added yet</div>
        ) : tasks.map((t, i) => (
          <div
            key={i}
            className={`flex items-start justify-between gap-3 px-2 py-1.5 ${i % 2 === 0 ? "bg-slate-100" : "bg-white"}`}
          >
            <div className="min-w-0 flex-1">
              <div className="text-[9px] text-slate-700">Task id: <span className="font-medium text-slate-900">{t.id || "—"}</span></div>
              <div className="text-[9px] text-slate-700 leading-snug mt-0.5">
                Task description: {t.description || <span className="italic text-slate-400">—</span>}
              </div>
            </div>
            <div className="text-[9.5px] font-medium text-slate-900 tabular-nums shrink-0 pt-2">
              {fmtHours(parsePLN(t.hours))}
            </div>
          </div>
        ))}
      </div>

      {/* Totals — Total hours left, money block right */}
      <div className="mt-5 grid grid-cols-2 gap-4 text-[10px]">
        <div className="font-bold text-slate-900">
          <span>Total, hours</span>
        </div>
        <div className="text-right font-bold text-slate-900 tabular-nums">
          {fmtHours(summary.hours)}
        </div>

        <div></div>
        <div className="space-y-1 mt-1">
          <div className="flex justify-between">
            <span className="text-slate-700">Net amount</span>
            <span className="font-semibold text-slate-900 tabular-nums">{fmtPLN(summary.net)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-700">VAT</span>
            <span className="font-semibold text-slate-900 tabular-nums">{fmtPLN(summary.vat)} {currency}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="font-bold text-brand">TOTAL DUE</span>
            <span className="font-bold text-brand tabular-nums">{fmtPLN(summary.total)} {currency}</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-10 grid grid-cols-2 gap-6 text-[9px] text-slate-900">
        <div>
          <div className="font-semibold mb-8">Client</div>
          <div className="border-b border-slate-400 h-px" />
        </div>
        <div>
          <div className="font-semibold mb-8">Executor</div>
          <div className="border-b border-slate-400 h-px" />
        </div>
      </div>
    </div>
  );
};

// =============================================================
// Toast
// =============================================================
const Toast = ({ open, title, body, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [open, onClose]);
  return (
    <div
      className={`fixed z-50 left-1/2 -translate-x-1/2 bottom-6 transition-all duration-200 ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}
    >
      <div className="flex items-start gap-3 rounded-xl bg-surface ring-1 ring-border shadow-2xl px-4 py-3 min-w-[280px]">
        <div className="size-8 rounded-full grid place-items-center bg-brand-soft text-brand-on shrink-0">
          <Icon name="check" size={16} strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-ink">{title}</div>
          {body && <div className="text-xs text-muted mt-0.5">{body}</div>}
        </div>
      </div>
    </div>
  );
};

// =============================================================
// Main App
// =============================================================
const App = () => {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "density": "comfortable",
    "showPreview": true,
    "vatRate": 23,
    "currency": "zł"
  }/*EDITMODE-END*/;

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const dense = tweaks.density === "compact";

  const [data, setData] = useState({
    email: "anna.kowalska@example.com",
    fullName: "Anna Kowalska",
    pricePerHour: "92,46",
    actNumber: "3",
    actDate: "2026-04-30",
    agreementDate: "2025-09-01",
    tasks: [
      { id: "CORE-152", description: "Designed onboarding flow for new B2B customer segment.", hours: "8" },
      { id: "CORE-184", description: "Refined dashboard navigation and added breadcrumbs.", hours: "5,5" },
      { id: "PLAT-21",  description: "Spec review with platform team; updated component tokens.", hours: "2" },
    ],
  });

  const [toast, setToast] = useState({ open: false, title: "", body: "" });

  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const updateTask = (i, t) => setData((d) => { const tasks = [...d.tasks]; tasks[i] = t; return { ...d, tasks }; });
  const removeTask = (i) => setData((d) => ({ ...d, tasks: d.tasks.filter((_, idx) => idx !== i) }));
  const addTask = () => setData((d) => ({ ...d, tasks: [...d.tasks, { id: "", description: "", hours: "" }] }));

  const summary = useMemo(() => {
    const rate = parsePLN(data.pricePerHour);
    const hours = data.tasks.reduce((s, t) => s + parsePLN(t.hours), 0);
    const net = hours * rate;
    const vat = net * (tweaks.vatRate / 100);
    const total = net + vat;
    return { hours, net, vat, total, rate, vatRate: tweaks.vatRate };
  }, [data, tweaks.vatRate]);

  const completion = useMemo(() => {
    let total = 5, filled = 0;
    if (data.email) filled++;
    if (data.fullName) filled++;
    if (data.pricePerHour) filled++;
    if (data.actNumber) filled++;
    if (data.tasks.some(t => t.id && t.description && parsePLN(t.hours) > 0)) filled++;
    return Math.round((filled / total) * 100);
  }, [data]);

  const handleCreate = () => {
    setToast({
      open: true,
      title: "Act generated",
      body: `Acceptance Act #${data.actNumber} · ${fmtPLN(summary.total)} ${tweaks.currency} ready to download.`,
    });
  };

  return (
    <div className="min-h-screen text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur bg-page/80 border-b border-border">
        <div className="max-w-[1280px] mx-auto h-14 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md grid place-items-center text-white font-bold text-xs bg-brand">
              A
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm tracking-tight">aktomat</span>
              <span className="text-xs text-muted hidden sm:inline">/ Acceptance Acts</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted">
              <Icon name="check" size={13} />
              <span>Saved <span className="text-ink">·</span> 2 minutes ago</span>
            </div>
            <button className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs text-muted hover:bg-hover ring-1 ring-border">
              <Kbd>⌘</Kbd><Kbd>K</Kbd>
              <span className="ml-1">Search</span>
            </button>
            <Avatar name={data.fullName || "User"} />
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted mb-1.5">
              <span>Documents</span>
              <Icon name="chevron" size={12} className="-rotate-90" />
              <span>Acts</span>
              <Icon name="chevron" size={12} className="-rotate-90" />
              <span className="text-ink">New</span>
            </div>
            <h1 className="text-[26px] font-semibold tracking-tight text-ink leading-tight">
              Acceptance Act Generator
            </h1>
            <p className="text-[13.5px] text-muted mt-1.5 max-w-xl">
              Fill in the details below and download a signed-ready PDF for your client. Drafts auto-save.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-muted uppercase tracking-wider font-medium">Completion</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-xs font-medium tabular-nums w-9 text-right">{completion}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className={`grid gap-6 ${tweaks.showPreview ? "xl:grid-cols-[1fr_460px]" : "grid-cols-1"}`}>
          {/* LEFT — form */}
          <div className="flex flex-col gap-5 min-w-0">
            {/* Personal Info */}
            <Card
              eyebrow="Step 1"
              title="Personal Info"
              dense={dense}
              action={
                <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
                  <Icon name="info" size={12} /> Used as contractor on the act
                </span>
              }
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email" htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    icon="mail"
                    value={data.email}
                    onChange={(e) => set({ email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </Field>
                <Field label="Full Name" htmlFor="name">
                  <Input
                    id="name"
                    icon="user"
                    value={data.fullName}
                    onChange={(e) => set({ fullName: e.target.value })}
                    placeholder="Anna Kowalska"
                  />
                </Field>
              </div>
            </Card>

            {/* Act Details */}
            <Card eyebrow="Step 2" title="Act Details" dense={dense}>
              <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
                <Field label="Price per hour" hint="Net rate, excluding VAT.">
                  <Input
                    icon="coins"
                    suffix={tweaks.currency}
                    value={data.pricePerHour}
                    onChange={(e) => set({ pricePerHour: e.target.value })}
                    placeholder="0,00"
                    className="text-right tabular-nums"
                  />
                </Field>
                <Field label="Act Number" hint="Sequential number for this client.">
                  <Input
                    icon="hash"
                    value={data.actNumber}
                    onChange={(e) => set({ actNumber: e.target.value })}
                    placeholder="3"
                  />
                </Field>
                <Field label="Act Date" hint="When this act is submitted.">
                  <Input
                    type="date"
                    icon="calendar"
                    value={data.actDate}
                    onChange={(e) => set({ actDate: e.target.value })}
                  />
                </Field>
                <Field label="Agreement Date" hint="When the agreement begins.">
                  <Input
                    type="date"
                    icon="calendar"
                    value={data.agreementDate}
                    onChange={(e) => set({ agreementDate: e.target.value })}
                  />
                </Field>
              </div>
            </Card>

            {/* Tasks */}
            <Card
              eyebrow="Step 3"
              title="Tasks"
              dense={dense}
              action={
                <Button variant="soft" icon="plus" onClick={addTask}>
                  Add Task
                </Button>
              }
            >
              {data.tasks.length === 0 ? (
                <div className="text-center py-10">
                  <div className="size-10 rounded-full bg-brand-soft text-brand-on grid place-items-center mx-auto">
                    <Icon name="briefcase" size={18} />
                  </div>
                  <p className="text-[13px] text-muted mt-3">No tasks yet. Add the work you've completed.</p>
                  <Button className="mt-3" variant="solid" icon="plus" onClick={addTask}>Add first task</Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {data.tasks.map((t, i) => (
                    <TaskRow
                      key={i}
                      index={i}
                      task={t}
                      onChange={(nt) => updateTask(i, nt)}
                      onRemove={() => removeTask(i)}
                      canRemove={data.tasks.length > 1}
                      dense={dense}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <span>{data.tasks.length} task{data.tasks.length === 1 ? "" : "s"} · {fmtHours(summary.hours)} h total</span>
                <button
                  onClick={addTask}
                  className="inline-flex items-center gap-1.5 text-brand-on hover:text-brand font-medium transition"
                >
                  <Icon name="plus" size={12} /> Add another
                </button>
              </div>
            </Card>

            {/* Summary */}
            <Card eyebrow="Step 4" title="Summary" dense={dense}>
              <dl className="divide-y divide-border">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[13px] text-muted">Total hours</dt>
                  <dd className="text-[13.5px] tabular-nums">{fmtHours(summary.hours)}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[13px] text-muted">Rate</dt>
                  <dd className="text-[13.5px] tabular-nums">{fmtPLN(summary.rate)} {tweaks.currency} / h</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[13px] text-muted">Net amount</dt>
                  <dd className="text-[13.5px] tabular-nums">{fmtPLN(summary.net)} {tweaks.currency}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[13px] text-muted">VAT ({summary.vatRate}%)</dt>
                  <dd className="text-[13.5px] tabular-nums">{fmtPLN(summary.vat)} {tweaks.currency}</dd>
                </div>
                <div className="flex items-center justify-between pt-3.5 mt-1">
                  <dt className="text-[13px] font-bold uppercase tracking-wider">Total Due</dt>
                  <dd className="text-xl font-bold tabular-nums text-brand">
                    {fmtPLN(summary.total)} {tweaks.currency}
                  </dd>
                </div>
              </dl>
            </Card>

            {/* Action bar */}
            <div className="sticky bottom-4 z-20">
              <div className="flex items-center gap-2 rounded-xl bg-surface ring-1 ring-border shadow-xl p-2">
                <div className="px-3 hidden sm:flex flex-col">
                  <span className="text-[11px] text-muted uppercase tracking-wider">Total Due</span>
                  <span className="text-[15px] font-semibold tabular-nums text-brand">
                    {fmtPLN(summary.total)} {tweaks.currency}
                  </span>
                </div>
                <div className="grow" />
                <Button variant="ghost" icon="eye" onClick={() => setTweak("showPreview", !tweaks.showPreview)}>
                  {tweaks.showPreview ? "Hide preview" : "Show preview"}
                </Button>
                <Button variant="outline" icon="file">Save draft</Button>
                <Button variant="solid" size="lg" icon="download" onClick={handleCreate}>
                  Create Act
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT — preview */}
          {tweaks.showPreview && (
            <aside className="hidden xl:block">
              <div className="sticky top-[78px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-muted">
                    <Icon name="eye" size={12} /> Live preview
                  </div>
                  <span className="text-[11px] text-muted">A4 · 1 page</span>
                </div>
                <div className="rounded-xl bg-sunken ring-1 ring-border p-6 overflow-hidden">
                  <PdfPreview data={data} summary={summary} currency={tweaks.currency} />
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
                  <Icon name="sparkle" size={12} /> Preview updates as you type
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      <Toast
        open={toast.open}
        title={toast.title}
        body={toast.body}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout">
          <TweakRadio
            label="Density"
            value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "comfortable", label: "Comfortable" },
              { value: "compact",     label: "Compact" },
            ]}
          />
          <TweakToggle
            label="Show live PDF preview"
            value={tweaks.showPreview}
            onChange={(v) => setTweak("showPreview", v)}
          />
        </TweakSection>
        <TweakSection label="Calculation">
          <TweakRadio
            label="VAT rate"
            value={tweaks.vatRate}
            onChange={(v) => setTweak("vatRate", Number(v))}
            options={[
              { value: 0,  label: "0 %" },
              { value: 8,  label: "8 %" },
              { value: 23, label: "23 %" },
            ]}
          />
          <TweakRadio
            label="Currency"
            value={tweaks.currency}
            onChange={(v) => setTweak("currency", v)}
            options={[
              { value: "zł",  label: "PLN" },
              { value: "€",   label: "EUR" },
              { value: "$",   label: "USD" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

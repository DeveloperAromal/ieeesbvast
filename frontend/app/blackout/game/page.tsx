"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Hint = { id: string; level: number; text: string; point_cost: number };
type DeadEnd = { riddle_question?: string; penalty_points?: number };
type Chapter = { id: string; stage_number: number; title: string; discipline: string; question: string; asset_url?: string | null; dead_end?: DeadEnd; hints?: Hint[] };
type Game = { game_id: string; game_name: string; game_subtitle: string; current_stage: number; score: number; penalty_points: number; maze_state: "door" | "dead_end" | "completed"; status: "in_progress" | "completed"; current_chapter?: Chapter };
type Rank = { team_registration_id: string; rank: number; team_name: string; score: number };

export default function BlackoutPage() {
  const router = useRouter();
  const { makeApiCall } = useApiCall();
  const [checking, setChecking] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [answer, setAnswer] = useState("");
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ranking, setRanking] = useState<Rank[]>([]);

  const refresh = useCallback(async () => {
    const result = await makeApiCall("GET", APIENDPOINT.BlackoutGame);
    if (!result.success || !result.data) {
      if (result.status === 401 || result.status === 403) {
        window.sessionStorage.removeItem("session_token");
        router.replace("/blackout/login");
      } else {
        setNotice(result.message || "Unable to load the game. Please refresh and try again.");
        setFailed(true);
        setChecking(false);
      }
      return;
    }
    const data = result.data as Game;
    setGame(data);
    const ranks = await makeApiCall("GET", APIENDPOINT.GetGameLeaderboard(data.game_id));
    if (ranks.success) setRanking(Array.isArray(ranks.data) ? ranks.data as Rank[] : []);
    setChecking(false);
  }, [makeApiCall, router]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [refresh]);

  const submit = async (answerType: "door" | "escape") => {
    if (!game?.current_chapter || !answer.trim()) return;
    setBusy(true); setNotice("");
    const result = await makeApiCall("POST", APIENDPOINT.SubmitGameAnswer, { game_id: game.game_id, stage_number: game.current_chapter.stage_number, answer, answer_type: answerType });
    const payload = result.data as { correct?: boolean; message?: string } | null;
    setNotice(payload?.message || result.message || "Unable to validate the answer.");
    setFailed(!result.success || !payload?.correct);
    setAnswer(""); setBusy(false);
    if (result.success) await refresh();
  };

  const requestHint = async () => {
    if (!game?.current_chapter) return;
    setBusy(true); setNotice("");
    const result = await makeApiCall("POST", APIENDPOINT.RequestGameHint, { game_id: game.game_id, stage_number: game.current_chapter.stage_number });
    setNotice(result.success ? "Hint unlocked. Its cost has been deducted from your score." : result.message || "No hint can be unlocked right now.");
    setFailed(!result.success); setBusy(false);
    if (result.success) await refresh();
  };

  if (checking) return <main className="dark flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading Blackout…</main>;
  if (!game?.current_chapter) return <main className="dark flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-sm text-muted-foreground"><p>{notice || "Blackout is unavailable."}</p><Button variant="outline" onClick={() => void refresh()}>Try again</Button></main>;

  const chapter = game.current_chapter;
  const trapped = game.maze_state === "dead_end";
  const completed = game.status === "completed" || game.maze_state === "completed";

  return <main className="dark min-h-screen bg-[#18181b] px-4 py-6 text-foreground sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl">
    <header className="mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${trapped ? "bg-destructive" : "bg-emerald-500"}`} /><p className="text-sm font-medium text-muted-foreground">Blackout CTF</p></div><h1 className="mt-1 text-2xl font-semibold tracking-tight">{game.game_name}</h1><p className="mt-1 text-sm text-muted-foreground">{game.game_subtitle || "Navigate the maze. One door at a time."}</p></div>
      <div className="grid grid-cols-3 divide-x rounded-lg border bg-card text-center shadow-sm"><Metric label="Score" value={game.score} /><Metric label="Door" value={game.current_stage} /><Metric label="Penalties" value={game.penalty_points} suffix=" pts" /></div>
    </header>

    {completed ? <Card className="mx-auto max-w-xl border-emerald-500/40 bg-emerald-500/5 py-8 text-center"><CardHeader><p className="text-sm font-medium text-emerald-600">Maze completed</p><CardTitle className="text-2xl">You escaped Blackout.</CardTitle><CardDescription>Final score: <span className="font-semibold text-foreground">{game.score}</span></CardDescription></CardHeader></Card> : <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className={trapped ? "border-destructive/45 bg-destructive/5" : undefined}>
        <CardHeader className="border-b">
          {trapped ? <div><p className="text-sm font-medium text-destructive">Deadlock active</p><CardTitle className="mt-1 text-2xl">You are deadlocked.</CardTitle><CardDescription className="mt-2">This door is sealed. Solve the escape challenge to return to Door {chapter.stage_number}.</CardDescription></div> : <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary">Door {chapter.stage_number}</p><CardTitle className="mt-1 text-2xl">{chapter.title}</CardTitle></div><span className="rounded-md border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{chapter.discipline}</span></div>}
        </CardHeader>
        <CardContent className="pt-6">
          {trapped ? <div className="rounded-lg border border-destructive/30 bg-background p-5"><p className="text-xs font-semibold tracking-wide text-destructive uppercase">Escape challenge</p><p className="mt-3 whitespace-pre-line leading-7 text-foreground">{chapter.dead_end?.riddle_question || "Find the escape route."}</p><p className="mt-4 text-sm text-muted-foreground">The {chapter.dead_end?.penalty_points ?? 0}-point penalty was applied when this deadlock was triggered.</p></div> : <><p className="whitespace-pre-line leading-7 text-foreground/90">{chapter.question}</p>{chapter.asset_url && <a href={chapter.asset_url} download className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Download size={16} /> Download Asset</a>}</>}
          <div className="mt-7 space-y-2"><label className="text-sm font-medium">{trapped ? "Escape answer" : "Flag / answer"}</label><Input value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !busy && void submit(trapped ? "escape" : "door")} placeholder={trapped ? "Enter the escape answer" : "Enter your answer"} disabled={busy} className="h-10" /></div>
          <div className="mt-4 flex items-center gap-3"><Button onClick={() => void submit(trapped ? "escape" : "door")} disabled={busy || !answer.trim()} variant={trapped ? "destructive" : "default"}>{busy ? "Checking…" : trapped ? "Escape deadlock" : "Submit answer"}</Button><span className="text-xs text-muted-foreground">Press Enter to submit</span></div>
          {notice && <div className={`mt-5 rounded-lg border px-3 py-2.5 text-sm ${failed ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"}`}>{notice}</div>}
        </CardContent>
      </Card>

      <aside className="space-y-6">
        {trapped ? <Card className="border-destructive/30 bg-destructive/5"><CardHeader><CardTitle>Controls locked</CardTitle><CardDescription>Hints and door controls return after you solve the escape challenge.</CardDescription></CardHeader></Card> : <Card><CardHeader><CardTitle>Hints</CardTitle><CardDescription>Hints are revealed only when requested and lower your score.</CardDescription></CardHeader><CardContent><Button variant="outline" className="w-full" onClick={() => void requestHint()} disabled={busy}>Request next hint</Button>{chapter.hints?.length ? <div className="mt-4 space-y-3">{chapter.hints.map((hint) => <div key={hint.id} className="rounded-lg border bg-muted/40 p-3"><p className="text-xs font-medium text-muted-foreground">Hint {hint.level} · −{hint.point_cost} pts</p><p className="mt-2 text-sm leading-6">{hint.text}</p></div>)}</div> : <p className="mt-4 text-sm text-muted-foreground">No hints unlocked yet.</p>}</CardContent></Card>}
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Leaderboard</CardTitle><CardDescription>Live rankings</CardDescription></div><Button variant="ghost" size="sm" onClick={() => void refresh()}>Refresh</Button></CardHeader><CardContent className="space-y-2">{ranking.length ? ranking.map((entry) => <div key={entry.team_registration_id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"><span className="truncate pr-2"><span className="mr-2 text-muted-foreground">#{entry.rank}</span>{entry.team_name}</span><span className="font-medium tabular-nums">{entry.score}</span></div>) : <p className="text-sm text-muted-foreground">No teams ranked yet.</p>}</CardContent></Card>
      </aside>
    </div>}
  </div></main>;
}

function Metric({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return <div className="min-w-24 px-4 py-2"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-0.5 text-lg font-semibold tabular-nums">{value}{suffix}</p></div>;
}

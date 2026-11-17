// Built from guides/blueit.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "blueit",
 "title": "Blueit (Reddit stories to narrated videos)",
 "goals": [
  "Decide with rules and regular expressions whether a post is a finished story, and say why",
  "Call an official API properly: app sign-in, a descriptive User-Agent, rate-limit headers, retries and backoff",
  "Save each story once in SQLite with an upsert that never resets its status",
  "Split text into sentences and pieces for narration, and time captions to the voice as an SRT file",
  "Drive FFmpeg safely from Python to make a video and cut it into one-minute parts only between sentences",
  "Keep slow, external things testable by passing in the network, clock and process runner"
 ],
 "prereqs": [
  "Python basics (dataclasses, regular expressions, unittest)",
  "SQL basics (tables, primary keys)"
 ],
 "sessions": [
  {
   "title": "From Reddit to a story library",
   "from": 0,
   "to": 3
  },
  {
   "title": "Narration, captions and video",
   "from": 4,
   "to": 6
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What Blueit does, and doing it responsibly",
   "body": "In this guide you'll walk through [Blueit](https://github.com/TheoYanvno/blueit): it finds **finished** stories on Reddit, narrates them, and turns each one into a video of still pictures with captions, saved whole and cut into one-minute parts for Shorts and TikTok.\n\n```text\nReddit search ─▶ finished-story check ─▶ clean text ─▶ narration audio ─▶ video with your pictures\n                                                                         └▶ output/<story>/full.mp4\n                                                                            output/<story>/part-01.mp4, part-02.mp4, …\n```\n\nIt's a big project (more than 100 tests, a React page and a Windows app), so this guide follows the Python core, one module at a time.\n\n### Responsible by design\n\nStories belong to the people who wrote them. Blueit:\n\n- reads Reddit only through the **official API**, signed in as an app that can't post, vote or see anything private\n- writes a `credit.txt` for every video and puts the writer's name in every caption and description\n- uploads to YouTube **private by default**, so you choose what goes public\n\nBeing able to explain choices like these matters as much as the code.\n\n```svg Blueit's modules: reddit.py fetches, complete.py checks, library.py saves, narrate.py speaks, captions.py times the text, video.py and parts.py use FFmpeg\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"130\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"15\" width=\"100\" height=\"45\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"55\" y=\"42\" text-anchor=\"middle\">reddit.py</text>\n  <rect x=\"115\" y=\"15\" width=\"100\" height=\"45\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"165\" y=\"42\" text-anchor=\"middle\">complete.py</text>\n  <rect x=\"225\" y=\"15\" width=\"100\" height=\"45\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"275\" y=\"42\" text-anchor=\"middle\">library.py</text>\n  <rect x=\"335\" y=\"15\" width=\"100\" height=\"45\" rx=\"8\" fill=\"#fce7f3\" stroke=\"#db2777\"/><text x=\"385\" y=\"42\" text-anchor=\"middle\">narrate.py</text>\n  <rect x=\"445\" y=\"15\" width=\"110\" height=\"45\" rx=\"8\" fill=\"#ede9fe\" stroke=\"#7c3aed\"/><text x=\"500\" y=\"42\" text-anchor=\"middle\">captions.py</text>\n  <rect x=\"280\" y=\"80\" width=\"130\" height=\"40\" rx=\"8\" fill=\"#e5e7eb\" stroke=\"#374151\"/><text x=\"345\" y=\"105\" text-anchor=\"middle\">video.py (FFmpeg)</text>\n  <rect x=\"425\" y=\"80\" width=\"130\" height=\"40\" rx=\"8\" fill=\"#e5e7eb\" stroke=\"#374151\"/><text x=\"490\" y=\"105\" text-anchor=\"middle\">parts.py (FFmpeg)</text>\n  <path d=\"M105 37 H111 M215 37 H221 M325 37 H331 M435 37 H441 M500 60 L345 76 M410 100 H421\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does Blueit sign in as an app that can only read public posts?",
     "options": [
      "It's faster than a user account",
      "It only needs to read, so it asks for the least access possible and can't post, vote or see private data",
      "Reddit doesn't allow user accounts"
     ],
     "answer": 1,
     "why": "Least privilege applies to API access too: ask only for what the program needs."
    },
    {
     "q": "What does Blueit do so writers are credited?",
     "options": [
      "Nothing; the stories are public",
      "A credit.txt for every video, and the writer's name in captions and video descriptions",
      "It emails every writer"
     ],
     "answer": 1,
     "why": "Public isn't the same as free to use without credit; crediting the writer is the minimum."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "Is it a finished story? Rules that explain themselves",
   "body": "`blueit/complete.py` decides whether a post is a whole story worth narrating. Every rule returns a **reason**, so `python -m blueit check` can say why a post was skipped.\n\n```python\n@dataclass(frozen=True)\nclass Verdict:\n    ok: bool\n    reason: str\n    part: int | None = None\n    final: bool = False\n```\n\nThe checks, in order:\n\n```python\nif story.removed or not story.body.strip():\n    return Verdict(False, \"removed, deleted or has no text\")\nif story.words < min_words:\n    return Verdict(False, f\"too short ({story.words} words, need {min_words})\")\n...\ntail = story.body[-600:]\nif UNFINISHED.search(tail) and not final:\n    return Verdict(False, \"ending says more is coming\", part, final)\n```\n\n### The regular expressions\n\n```python\nPART = re.compile(r\"\\b(?:part|pt\\.?)\\s*(\\d+|[ivx]+)\\b|\\(\\s*(\\d+)\\s*/\\s*(\\d+)\\s*\\)\", re.I)\nUNFINISHED = re.compile(r\"to be continued|\\btbc\\b|stay tuned|next part|(?:update|more) (?:soon|to come|coming)\", re.I)\n```\n\n- `PART` finds \"Part 2\", \"Pt. 3\", \"Part II\" and \"(2/5)\". `(?:...)` groups without capturing; `\\b` is a word boundary; `re.I` ignores case.\n- \"Part II\" uses **Roman numerals**, so a small `_roman()` function turns `ii` into 2.\n- `UNFINISHED` only checks the **last 600 characters**. A story that quotes \"to be continued\" in the middle is still finished.\n- A title like \"(Final)\" or \"(5/5)\" marks the last part of a series; then the earlier parts are found in the author's own posts and joined in order.\n\nExplaining your rules in words (\"too short (212 words, need 400)\") turns a black box into something people trust and can tune.\n\n```svg The finished-story check: a series of rules, each either passing the post on or stopping it with a reason\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 120\" font-family=\"sans-serif\" font-size=\"11\">\n  <rect width=\"560\" height=\"120\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"15\" width=\"95\" height=\"40\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"52\" y=\"39\" text-anchor=\"middle\">removed?</text>\n  <rect x=\"115\" y=\"15\" width=\"95\" height=\"40\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"162\" y=\"39\" text-anchor=\"middle\">NSFW?</text>\n  <rect x=\"225\" y=\"15\" width=\"95\" height=\"40\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"272\" y=\"39\" text-anchor=\"middle\">400–12,000 words?</text>\n  <rect x=\"335\" y=\"15\" width=\"95\" height=\"40\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"382\" y=\"39\" text-anchor=\"middle\">\"more coming\"?</text>\n  <rect x=\"445\" y=\"15\" width=\"110\" height=\"40\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"500\" y=\"33\" text-anchor=\"middle\">stand-alone or</text><text x=\"500\" y=\"47\" text-anchor=\"middle\">final part ✓</text>\n  <rect x=\"115\" y=\"75\" width=\"330\" height=\"35\" rx=\"6\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"280\" y=\"97\" text-anchor=\"middle\">skipped, with a reason: \"too short (212 words, need 400)\"</text>\n  <path d=\"M100 35 H111 M210 35 H221 M320 35 H331 M430 35 H441 M52 55 L150 75 M162 55 L200 75 M272 55 L280 75 M382 55 L360 75\" stroke=\"#374151\" stroke-width=\"1.5\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does the \"more is coming\" check only look at the last 600 characters?",
     "options": [
      "Regular expressions can't search long text",
      "Endings are where \"to be continued\" matters; a story can quote the phrase in the middle and still be finished",
      "To save memory"
     ],
     "answer": 1,
     "why": "Where you look matters as much as what you look for. Checking the tail avoids false alarms."
    },
    {
     "q": "Why does every rule return a reason, not just True or False?",
     "options": [
      "So the tool can explain every decision, and people can trust it or change the limits",
      "Python requires a message",
      "Reasons make it faster"
     ],
     "answer": 0,
     "why": "Explainable rules are easier to debug, test and tune than a bare yes or no."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "Calling Reddit's API the right way",
   "body": "`blueit/reddit.py` uses only the standard library (`urllib`) and follows Reddit's API rules.\n\n### Sign in as an app\n\n```python\nbasic = base64.b64encode(f\"{client_id}:{client_secret}\".encode()).decode()\nreq = urllib.request.Request(\n    \"https://www.reddit.com/api/v1/access_token\",\n    data=urllib.parse.urlencode({\"grant_type\": \"client_credentials\"}).encode(),\n    headers={\"Authorization\": f\"Basic {basic}\", \"User-Agent\": self.creds.user_agent},\n    method=\"POST\",\n)\n```\n\nThis is **OAuth's client-credentials** flow: the app's id and secret buy a short-lived **access token**, reused until about a minute before it expires. The id and secret come from a `.env` file that git ignores; they're never written into the code.\n\n### Say who you are, and respect the limits\n\n- **User-Agent:** `python:blueit:1.0.0 (by /u/yourname)`. Reddit asks every client for a descriptive one.\n- **Rate limits:** each answer has `X-Ratelimit-Remaining` and `X-Ratelimit-Reset`. When nothing is left, Blueit sleeps until the window resets.\n- **Retries with backoff:** on 429 or a 5xx error it waits `Retry-After` seconds if given, else 1, 2, then 4 seconds (`2 ** attempt`), and tries again. A 401 means the token expired early: sign in once more.\n\n### Testable without the internet\n\n```python\n@dataclass\nclass Reddit:\n    creds: Credentials\n    opener: Opener = _default_open\n    sleep: Callable[[float], None] = time.sleep\n    clock: Callable[[], float] = time.time\n```\n\nThe network, `sleep` and the clock are **fields with real defaults**. Tests pass in a fake opener that returns saved JSON and a fake sleep that records how long it would have waited, so a test of \"wait 4 seconds after the third 503\" runs instantly.\n\n```svg Every request: wait if the rate limit is used up, send it with the token and User-Agent, then on 429 or 5xx back off and retry, on 401 sign in again\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"130\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"40\" width=\"110\" height=\"50\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"60\" y=\"62\" text-anchor=\"middle\">limit left?</text><text x=\"60\" y=\"78\" text-anchor=\"middle\">else wait</text>\n  <rect x=\"140\" y=\"40\" width=\"120\" height=\"50\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"200\" y=\"62\" text-anchor=\"middle\">send: token +</text><text x=\"200\" y=\"78\" text-anchor=\"middle\">User-Agent</text>\n  <rect x=\"290\" y=\"5\" width=\"120\" height=\"35\" rx=\"6\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"350\" y=\"27\" text-anchor=\"middle\">200: read JSON</text>\n  <rect x=\"290\" y=\"48\" width=\"120\" height=\"35\" rx=\"6\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"350\" y=\"70\" text-anchor=\"middle\">429/5xx: back off</text>\n  <rect x=\"290\" y=\"91\" width=\"120\" height=\"35\" rx=\"6\" fill=\"#ede9fe\" stroke=\"#7c3aed\"/><text x=\"350\" y=\"113\" text-anchor=\"middle\">401: new token</text>\n  <text x=\"425\" y=\"70\">wait 1, 2, 4 s</text><text x=\"425\" y=\"86\">then try again</text>\n  <path d=\"M115 65 H136 M260 60 L286 22 M260 65 H286 M260 70 L286 108\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why does Blueit wait 1, then 2, then 4 seconds between retries?",
     "options": [
      "Reddit requires exactly those numbers",
      "Exponential backoff gives a busy server more room each time instead of hammering it",
      "To make the program look busy"
     ],
     "answer": 1,
     "why": "Backing off is polite and effective; immediate retries make an overloaded service worse."
    },
    {
     "q": "Why are opener, sleep and clock fields of the Reddit class?",
     "options": [
      "Dataclasses need at least four fields",
      "Tests can pass in fakes, so retries and rate limits are tested instantly and offline",
      "To support several Reddits"
     ],
     "answer": 1,
     "why": "Injecting time and the network is how you test code that waits and talks to the outside world."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 18
  },
  {
   "title": "The story library: SQLite with an upsert",
   "body": "Every finished story `fetch` finds goes into one SQLite file, `library.db`, **once**, by its Reddit id:\n\n```sql\nCREATE TABLE IF NOT EXISTS stories (\n    id          TEXT PRIMARY KEY,\n    subreddit   TEXT NOT NULL,\n    title       TEXT NOT NULL,\n    body        TEXT NOT NULL,\n    score       INTEGER NOT NULL DEFAULT 0,\n    status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'narrated')),\n    ...\n);\n```\n\nFetching the same story again must refresh its score and text but **never** reset it to \"new\" after it's been narrated. That's an **upsert**: insert, or update if it's already there:\n\n```python\nself.db.execute(\n    \"\"\"INSERT INTO stories (id, subreddit, title, author, url, body, words, score, created_utc, parts, added_at)\n       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n       ON CONFLICT (id) DO UPDATE SET\n         title = excluded.title, body = excluded.body, words = excluded.words,\n         score = excluded.score, parts = excluded.parts\"\"\",\n    (...),\n)\n```\n\n`excluded` means \"the row you tried to insert\". The `SET` list names exactly what may change, and `status` isn't in it.\n\n### Searching with LIKE, safely\n\n`find cabin` searches titles and text with `LIKE '%cabin%'`. In LIKE, `%` and `_` are wildcards, so a search for `100%` would match too much. A helper escapes them:\n\n```python\ndef _like(word):\n    return \"%\" + word.replace(\"\\\\\", \"\\\\\\\\\").replace(\"%\", \"\\\\%\").replace(\"_\", \"\\\\_\") + \"%\"\n```\n\nand the query says `LIKE ? ESCAPE '\\'`. Values always go in `?` placeholders, never into the SQL string.\n\n```svg An upsert: a new id is inserted with status new; an id that's already there gets its title, text and score refreshed while its status stays the same\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"120\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"40\" width=\"120\" height=\"45\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"65\" y=\"67\" text-anchor=\"middle\">fetched story</text>\n  <rect x=\"170\" y=\"5\" width=\"170\" height=\"45\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"255\" y=\"25\" text-anchor=\"middle\">new id → INSERT</text><text x=\"255\" y=\"41\" text-anchor=\"middle\">status = new</text>\n  <rect x=\"170\" y=\"70\" width=\"170\" height=\"45\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"255\" y=\"90\" text-anchor=\"middle\">id exists → UPDATE</text><text x=\"255\" y=\"106\" text-anchor=\"middle\">score, text (not status)</text>\n  <text x=\"360\" y=\"95\">narrated stays narrated</text>\n  <path d=\"M125 62 L166 27 M125 62 L166 92\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does ON CONFLICT (id) DO UPDATE SET ... do?",
     "options": [
      "Deletes the old row and inserts the new one",
      "Inserts the row, or if that id exists, updates only the listed columns of the existing row",
      "Raises an error on duplicates"
     ],
     "answer": 1,
     "why": "An upsert keeps one row per id; listing the columns protects ones like status from being reset."
    },
    {
     "q": "Why escape % and _ in a LIKE search?",
     "options": [
      "They're wildcards in LIKE, so a search for 100% or snake_case would match the wrong things",
      "SQLite can't store them",
      "To stop SQL injection, which placeholders can't"
     ],
     "answer": 0,
     "why": "Placeholders stop injection; escaping wildcards makes the search mean exactly what was typed."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15,
   "uses": [
    "sql"
   ]
  },
  {
   "title": "Sentences, pieces and narration",
   "body": "`blueit/narrate.py` reads the cleaned story aloud with a voice that needs no extra packages: the voices **built into Windows** (through PowerShell's System.Speech), or **eSpeak NG** elsewhere.\n\nIt doesn't send the whole story at once. It splits it into **pieces** of at most about 300 characters:\n\n```python\n_SENTENCE = re.compile(r\"(?<=[.!?…])[\\\"”’)\\]]*\\s+(?=[\\\"“‘(\\[]?[A-Z0-9])\")\n```\n\nThat splits after `.`, `!`, `?` or `…` (a **lookbehind**, `(?<=...)`), keeps closing quotes with their sentence, and only splits before something that starts a new sentence (a **lookahead**, `(?=...)`). Sentences are grouped into pieces without crossing a paragraph break; a very long sentence is split at commas.\n\n### Why pieces?\n\n- Every voice engine is fast and reliable on short text.\n- Each piece becomes one audio file, and the files are joined with a short pause, longer between paragraphs.\n- Most important: Blueit knows exactly **when each piece starts and ends**. Those timings drive the captions and the cut points for the parts.\n\n```python\n@dataclass(frozen=True)\nclass Segment:\n    start: float\n    end: float\n    text: str\n```\n\n```svg Narration in pieces: sentences are grouped into short pieces, each spoken to its own audio file, then joined with pauses; each piece's start and end time is kept\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"110\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"40\" width=\"130\" height=\"40\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"75\" y=\"64\" text-anchor=\"middle\">piece 1: 0.0–7.4 s</text>\n  <rect x=\"150\" y=\"40\" width=\"20\" height=\"40\" fill=\"#f3f4f6\" stroke=\"#9ca3af\"/>\n  <rect x=\"180\" y=\"40\" width=\"150\" height=\"40\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"255\" y=\"64\" text-anchor=\"middle\">piece 2: 7.8–16.1 s</text>\n  <rect x=\"340\" y=\"40\" width=\"40\" height=\"40\" fill=\"#e5e7eb\" stroke=\"#9ca3af\"/>\n  <rect x=\"390\" y=\"40\" width=\"160\" height=\"40\" rx=\"6\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"470\" y=\"64\" text-anchor=\"middle\">piece 3: 17.0–24.9 s</text>\n  <text x=\"160\" y=\"30\" text-anchor=\"middle\">pause</text><text x=\"360\" y=\"30\" text-anchor=\"middle\">paragraph</text>\n  <text x=\"280\" y=\"102\" text-anchor=\"middle\">each piece keeps its start and end: captions and cuts use them</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does (?<=[.!?…]) mean in the sentence pattern?",
     "options": [
      "Match a period and remove it",
      "A lookbehind: the split only happens right after a period, !, ? or …, which stays with its sentence",
      "Any character except those"
     ],
     "answer": 1,
     "why": "Lookarounds check what's before or after a position without consuming it."
    },
    {
     "q": "What's the biggest benefit of narrating in pieces?",
     "options": [
      "Smaller WAV files",
      "Each piece's start and end time is known, which times the captions and decides where parts can be cut",
      "It lets several voices read at once"
     ],
     "answer": 1,
     "why": "Splitting work into pieces gave timing information for free, which three later steps rely on."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Captions as an SRT file",
   "body": "`blueit/captions.py` turns the timed pieces into short on-screen captions. A piece can be several sentences, too much for a phone screen, so each piece is wrapped into lines of at most 24 characters and grouped two lines at a time:\n\n```python\ndef captions(segments, max_chars=24, max_lines=2):\n    out = []\n    for seg in segments:\n        lines = wrap(seg.text, max_chars)\n        groups = [tuple(lines[i:i + max_lines]) for i in range(0, len(lines), max_lines)]\n        words = [sum(len(l.split()) for l in g) for g in groups]\n        total = sum(words) or 1\n        t = seg.start\n        for i, (g, n) in enumerate(zip(groups, words)):\n            end = seg.end if i == len(groups) - 1 else round(t + (seg.end - seg.start) * n / total, 3)\n            out.append(Caption(round(t, 3), round(end, 3), g))\n            t = end\n    return out\n```\n\nThe piece's time is **shared by word count**: people read about as fast as the narrator speaks, so a caption with twice the words stays up twice as long. The last caption always ends exactly when the piece does.\n\n### The SRT format\n\n```text\n1\n00:00:00,000 --> 00:00:03,120\nI never should have gone\nback to the cabin.\n```\n\nA number, a time range with milliseconds after a **comma**, the text, and a blank line. `timestamp()` builds the time with `divmod`:\n\n```python\nms = int(round(seconds * 1000))\nh, ms = divmod(ms, 3_600_000)\nm, ms = divmod(ms, 60_000)\ns, ms = divmod(ms, 1000)\nreturn f\"{h:02}:{m:02}:{s:02},{ms:03}\"\n```\n\nThe same `captions.srt` is burned into the video and can be uploaded to YouTube or TikTok as real subtitles.\n\n```svg Sharing a piece's time: a 9-second piece split into two captions of 6 and 3 words gets 6 and 3 seconds\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"100\" fill=\"#ffffff\"/>\n  <rect x=\"20\" y=\"30\" width=\"520\" height=\"20\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"280\" y=\"25\" text-anchor=\"middle\">one piece, 0–9 s, 9 words</text>\n  <rect x=\"20\" y=\"60\" width=\"346\" height=\"25\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"193\" y=\"77\" text-anchor=\"middle\">caption 1: 6 words → 0–6 s</text>\n  <rect x=\"366\" y=\"60\" width=\"174\" height=\"25\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"453\" y=\"77\" text-anchor=\"middle\">caption 2: 3 words → 6–9 s</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "How long does each caption stay on screen?",
     "options": [
      "The same time for every caption",
      "Its share of the piece's time, by how many words it has",
      "Until the person taps the screen"
     ],
     "answer": 1,
     "why": "Sharing by words matches reading speed to the voice without measuring each word's audio."
    },
    {
     "q": "In SRT, what separates the seconds from the milliseconds?",
     "options": [
      "A period",
      "A comma, as in 00:00:03,120",
      "A colon"
     ],
     "answer": 1,
     "why": "SRT uses a comma there; using a period is a common bug that some players reject."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "FFmpeg from Python: the video and its parts",
   "body": "Blueit doesn't edit video itself. It builds an **FFmpeg** command and runs it with `subprocess`:\n\n```python\nvf = f\"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1,fps=30,format=yuv420p\"\nvf += f\",subtitles={captions}:force_style='{CAPTION_STYLE}'\"\ncmd = [exe, \"-hide_banner\", \"-loglevel\", \"error\", \"-y\",\n       \"-f\", \"concat\", \"-safe\", \"0\", \"-i\", \"shots.txt\",      # the pictures and how long each shows\n       \"-i\", \"narration.wav\", \"-vf\", vf,\n       \"-c:v\", \"libx264\", \"-preset\", \"veryfast\", \"-crf\", \"23\", \"-pix_fmt\", \"yuv420p\",\n       \"-c:a\", \"aac\", \"-b:a\", \"160k\", \"-shortest\", \"-movflags\", \"+faststart\", \"full.mp4\"]\nr = runner(cmd, cwd=folder, capture_output=True, text=True)\n```\n\n- **`shots.txt`** is a concat list: each picture and how many seconds it stays, changing only between sentences.\n- **Scale up, then crop**: every picture fills the 1080 × 1920 frame and nothing is stretched.\n- **Burned-in captions** with the `subtitles` filter, so they show everywhere.\n- **H.264 + AAC, yuv420p**: the formats every phone and site plays.\n- **A list of arguments, never one string**: no shell is involved, so a story title with quotes or `&` can't break the command or run anything. It also works the same on Windows.\n- **`runner=subprocess.run` is a parameter**: tests pass a fake runner and check the command without running FFmpeg.\n\n### One-minute parts, cut only between sentences\n\n```python\ndef cut_points(segments, clip_seconds=60):\n    total = segments[-1].end\n    parts, start = [], 0.0\n    while total - start > clip_seconds:\n        fits = [s.end for s in segments if start < s.end <= start + clip_seconds]\n        end = fits[-1] if fits else next(s.end for s in segments if s.end > start)\n        parts.append((round(start, 3), round(end, 3)))\n        start = end\n    if total - start > 0.01:\n        parts.append((round(start, 3), round(total, 3)))\n    return parts\n```\n\nEach part ends at the **last piece boundary that fits** in 60 seconds, so no part starts or stops mid-sentence. Each part is re-encoded so it starts exactly on its cut.\n\n### Explain it in an interview\n\n1. **What:** \"A Python tool that finds finished Reddit stories, narrates them and makes captioned videos and one-minute parts.\"\n2. **How:** \"Rules that explain themselves, the official API with backoff and rate limits, SQLite with an upsert, narration in timed pieces, SRT captions shared by word count, FFmpeg driven with argument lists.\"\n3. **Testing:** \"The network, clock, sleep and process runner are injected, so 100+ tests run offline; a few run real FFmpeg.\"\n4. **Responsible:** \"Least-privilege API access, writers credited everywhere, uploads private by default.\"\n\n```svg Cutting parts: each part ends at the last sentence boundary inside 60 seconds, so a 150-second video becomes parts of about 58, 57 and 35 seconds\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 100\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"100\" fill=\"#ffffff\"/>\n  <path d=\"M20 40 H540\" stroke=\"#9ca3af\" stroke-width=\"10\"/>\n  <path d=\"M60 32 v16 M110 32 v16 M170 32 v16 M218 32 v16 M270 32 v16 M330 32 v16 M384 32 v16 M440 32 v16 M500 32 v16\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <rect x=\"20\" y=\"60\" width=\"198\" height=\"25\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"119\" y=\"77\" text-anchor=\"middle\">part-01 (≤60 s)</text>\n  <rect x=\"218\" y=\"60\" width=\"166\" height=\"25\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"301\" y=\"77\" text-anchor=\"middle\">part-02</text>\n  <rect x=\"384\" y=\"60\" width=\"156\" height=\"25\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"462\" y=\"77\" text-anchor=\"middle\">part-03</text>\n  <text x=\"280\" y=\"22\" text-anchor=\"middle\">tick marks: where each narration piece ends</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why pass FFmpeg's arguments as a list instead of one command string?",
     "options": [
      "No shell parses it, so quotes or & in a title can't break the command or run anything",
      "Lists are faster than strings",
      "FFmpeg only accepts lists"
     ],
     "answer": 0,
     "why": "Argument lists avoid shell injection and quoting bugs on every operating system."
    },
    {
     "q": "Where does a one-minute part end?",
     "options": [
      "Exactly at 60.000 seconds",
      "At the last narration piece boundary that fits within 60 seconds, so no sentence is cut in half",
      "At a random point"
     ],
     "answer": 1,
     "why": "Cutting at known sentence boundaries keeps every clip watchable on its own."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 18
  }
 ],
 "finish": "You walked through a large Python project end to end. You learned:\n\n- **Explainable rules** with regular expressions, lookarounds and Roman numerals\n- An **official API** done right: OAuth client credentials, a User-Agent, **rate limits** and **exponential backoff**\n- **Dependency injection** of the network, clock, sleep and process runner for offline tests\n- **SQLite upserts** that protect a status column, and **safe LIKE** searches\n- **Narration in timed pieces**, and captions shared by word count in **SRT**\n- **FFmpeg** from Python with argument lists, and **cut points** between sentences\n- Building it **responsibly**: least privilege, credit and private-by-default uploads\n\n### Challenges\n\n1. Add a `--min-score` rule to the finished-story check with its own reason, and a test.\n2. Add a caption style option (font size or position) that changes the FFmpeg `force_style`, with a test of the built command.\n3. Write `python -m blueit stats`: counts of new and narrated stories per subreddit, from one SQL query with GROUP BY."
};

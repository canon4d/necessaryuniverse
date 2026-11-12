#!/usr/bin/env python3
"""
LaTeX -> structured JSON converter for the Necessary Universe series and its studies.

Produces a rich, render-ready tree:
  paper = { meta, abstract[inline], blocks[], toc[], bibliography[], footnotes[], labels{} }

Block kinds: heading, paragraph, math, theorem, proof, box, list, table, bib
Inline token kinds: text, math, strong, em, code, link, ref, cite, fn, br
"""
import json, os, re, sys

SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "papers-src")
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "content", "papers.json")

PAPERS = [
    ("why",  "shape-of-reality.tex"),
    ("what", "the-klein-block.tex"),
    ("how",  "twisted-dynamics-on-the-klein-block.tex"),
    ("studies-1", "klein-block-studies-i.tex"),
]

# ---------------------------------------------------------------- utilities

def strip_comments(s: str) -> str:
    out = []
    for line in s.split("\n"):
        res, i, n = [], 0, len(line)
        while i < n:
            c = line[i]
            if c == "\\" and i + 1 < n:
                res.append(line[i:i+2]); i += 2; continue
            if c == "%":
                break
            res.append(c); i += 1
        out.append("".join(res))
    return "\n".join(out)


def match_brace(s: str, i: int) -> int:
    """s[i] == '{'  -> index just past matching '}'"""
    assert s[i] == "{"
    depth, n = 0, len(s)
    while i < n:
        c = s[i]
        if c == "\\":
            i += 2; continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    return n


def read_group(s: str, i: int):
    """Read optional whitespace then a {..} group. Returns (content, next_i) or (None, i)."""
    j = i
    while j < len(s) and s[j] in " \t\n":
        j += 1
    if j < len(s) and s[j] == "{":
        e = match_brace(s, j)
        return s[j+1:e-1], e
    return None, i


def read_optional(s: str, i: int):
    """Read optional [..] argument."""
    j = i
    while j < len(s) and s[j] in " \t":
        j += 1
    if j < len(s) and s[j] == "[":
        depth, k = 0, j
        while k < len(s):
            if s[k] == "\\":
                k += 2; continue
            if s[k] == "[":
                depth += 1
            elif s[k] == "]":
                depth -= 1
                if depth == 0:
                    return s[j+1:k], k + 1
            k += 1
    return None, i


def find_env_end(s: str, name: str, start: int):
    """Find index of matching \\end{name} from start; returns (inner_end, after_end)."""
    bre = re.compile(r"\\begin\{" + re.escape(name) + r"\}")
    ere = re.compile(r"\\end\{" + re.escape(name) + r"\}")
    depth, i = 1, start
    while i < len(s):
        mb = bre.search(s, i)
        me = ere.search(s, i)
        if me is None:
            return len(s), len(s)
        if mb is not None and mb.start() < me.start():
            depth += 1; i = mb.end(); continue
        depth -= 1
        if depth == 0:
            return me.start(), me.end()
        i = me.end()
    return len(s), len(s)


# ---------------------------------------------------------------- text layer

ACCENTS = {
    "'a": "á", "'e": "é", "'i": "í", "'o": "ó", "'u": "ú", "'c": "ć", "'n": "ń",
    '"a': "ä", '"o': "ö", '"u': "ü", '"e': "ë", '"i': "ï",
    "`a": "à", "`e": "è", "`i": "ì", "`o": "ò", "`u": "ù",
    "^a": "â", "^e": "ê", "^i": "î", "^o": "ô", "^u": "û",
    "~n": "ñ", "~a": "ã", "~o": "õ",
    "ca": "ǎ", "cc": "ç", "cs": "ş",
    "va": "ǎ", "vc": "č", "vs": "š", "vz": "ž", "ve": "ě", "vr": "ř",
    "ua": "ă", "uu": "ŭ",
    ".z": "ż", ".e": "ė",
    "=a": "ā", "=e": "ē", "=o": "ō", "=u": "ū", "=i": "ī",
}

DROP_NOARG = {
    "newpage", "clearpage", "pagebreak", "phantomsection", "tableofcontents",
    "CanonTitlePage", "CanonBibliographySetup", "medskip", "bigskip", "smallskip",
    "noindent", "centering", "raggedright", "arraybackslash", "ornament",
    "seriesrule", "seriesmark", "architecturalmark", "toprule", "midrule",
    "bottomrule", "hline", "par", "small", "normalsize", "footnotesize",
    "linebreak", "allowbreak", "protect", "sffamily", "bfseries", "itshape",
    "textwidth", "columnwidth", "hfill", "leavevmode", "singlespacing",
}
DROP_1ARG = {
    "pagenumbering", "label", "vspace", "hspace", "index",
    "sectionmark", "subsectionmark", "markboth", "captionsetup", "thispagestyle",
    "pagestyle", "renewcommand", "setlength", "arraystretch", "phantom",
}
DROP_2ARG = {"setcounter", "addtocounter", "refstepcounter"}
DROP_3ARG = {"addcontentsline"}


def decode_text(s: str) -> str:
    """Literal-text replacements applied to plain runs only."""
    s = s.replace("\\%", "%").replace("\\&", "&").replace("\\_", "_")
    s = s.replace("\\#", "#").replace("\\{", "{").replace("\\}", "}")
    s = s.replace("\\$", "$").replace("\\,", "\u2009").replace("\\;", " ")
    s = s.replace("\\ ", " ").replace("~", "\u00a0")
    s = s.replace("\\ldots", "…").replace("\\dots", "…").replace("\\textellipsis", "…")
    s = s.replace("\\textemdash", "—").replace("\\textendash", "–")
    s = s.replace("\\&", "&")
    s = s.replace("---", "—").replace("--", "–")
    s = s.replace("``", "\u201c").replace("''", "\u201d")
    s = re.sub(r"(?<![\w\u201c])`", "\u2018", s)
    s = re.sub(r"(?<!\w)'(?=\w)", "\u2018", s)
    s = re.sub(r"(?<=\w)'(?!\w)", "\u2019", s)
    s = s.replace("'", "\u2019")
    s = re.sub(r"[ \t]*\n[ \t]*", " ", s)
    s = re.sub(r"[ \t]{2,}", " ", s)
    return s


class Ctx:
    """Shared document state: labels, counters, citations, footnotes."""
    def __init__(self):
        self.labels = {}        # label -> {"num": str, "kind": str, "anchor": str}
        self.pending_label = None
        self.cites = []         # ordered bib keys as encountered
        self.bibindex = {}      # key -> number
        self.footnotes = []
        self.eqcount = 0
        self.counters = {}
        # Studies I uses \cref/\Cref for the name+number. Documents keep the
        # historical number-only rendering, including Document I's one \cref.
        self.named_cref = False


def inline(s: str, ctx: Ctx):
    """LaTeX inline fragment -> token list."""
    toks, buf, i, n = [], [], 0, len(s)

    def flush():
        if buf:
            t = decode_text("".join(buf))
            if t:
                toks.append({"t": "text", "v": t})
            buf.clear()

    while i < n:
        c = s[i]

        # math
        if c == "$":
            if s.startswith("$$", i):
                e = s.find("$$", i + 2)
                e = n if e < 0 else e
                flush(); toks.append({"t": "math", "v": s[i+2:e].strip(), "d": True})
                i = e + 2; continue
            e = i + 1
            while e < n:
                if s[e] == "\\":
                    e += 2; continue
                if s[e] == "$":
                    break
                e += 1
            flush(); toks.append({"t": "math", "v": s[i+1:e].strip()})
            i = e + 1; continue

        if s.startswith("\\(", i):
            e = s.find("\\)", i)
            e = n if e < 0 else e
            flush(); toks.append({"t": "math", "v": s[i+2:e].strip()})
            i = e + 2; continue

        if s.startswith("\\\\", i):
            flush(); toks.append({"t": "br"}); i += 2
            # swallow optional spacing arg
            _, i = read_optional(s, i)
            continue

        if c == "{":
            e = match_brace(s, i)
            sub = inline(s[i+1:e-1], ctx)
            flush(); toks.extend(sub); i = e; continue

        if c == "\\":
            m = re.match(r"\\([a-zA-Z@]+)\*?", s[i:])
            if not m:
                # accent or escaped symbol
                two = s[i+1:i+3]
                if two[:1] in "'\"`^~.=cvu":
                    g, j = read_group(s, i + 2)
                    if g is not None:
                        key = two[0] + g
                        buf.append(ACCENTS.get(key, g)); i = j; continue
                    key = s[i+1:i+3]
                    if key in ACCENTS:
                        buf.append(ACCENTS[key]); i += 3; continue
                buf.append(s[i+1:i+2]); i += 2; continue

            cmd = m.group(1)
            j = i + m.end() - 0
            j = i + len(m.group(0))

            if cmd in ("emph", "textit", "textsl"):
                g, j2 = read_group(s, j)
                flush(); toks.append({"t": "em", "c": inline(g or "", ctx)}); i = j2; continue
            if cmd in ("textbf", "strong"):
                g, j2 = read_group(s, j)
                flush(); toks.append({"t": "strong", "c": inline(g or "", ctx)}); i = j2; continue
            if cmd in ("texttt", "verb", "code"):
                g, j2 = read_group(s, j)
                flush(); toks.append({"t": "code", "v": (g or "")}); i = j2; continue
            if cmd in ("textsc",):
                g, j2 = read_group(s, j)
                flush(); toks.append({"t": "sc", "c": inline(g or "", ctx)}); i = j2; continue
            if cmd == "href":
                g1, j2 = read_group(s, j)
                g2, j3 = read_group(s, j2)
                flush(); toks.append({"t": "link", "href": (g1 or "").strip(),
                                      "c": inline(g2 or "", ctx)}); i = j3; continue
            if cmd == "url":
                g1, j2 = read_group(s, j)
                u = (g1 or "").strip()
                flush(); toks.append({"t": "link", "href": u, "c": [{"t": "text", "v": u}]})
                i = j2; continue
            if cmd == "footnote":
                g, j2 = read_group(s, j)
                ctx.footnotes.append(inline(g or "", ctx))
                flush(); toks.append({"t": "fn", "n": len(ctx.footnotes)}); i = j2; continue
            if cmd in ("ref", "autoref", "cref", "Cref", "eqref"):
                g, j2 = read_group(s, j)
                flush()
                if ctx.named_cref and cmd in ("cref", "Cref"):
                    keys = [k.strip() for k in (g or "").split(",") if k.strip()]
                    mark = "C" if cmd == "Cref" else "c"
                    for k in keys or [""]:
                        toks.append({"t": "ref", "k": k, "eq": False, "cref": mark})
                else:
                    toks.append({"t": "ref", "k": (g or "").strip(), "eq": cmd == "eqref"})
                i = j2; continue
            if cmd == "cite":
                opt, j1 = read_optional(s, j)
                g, j2 = read_group(s, j1)
                keys = [k.strip() for k in (g or "").split(",") if k.strip()]
                for k in keys:
                    if k not in ctx.bibindex:
                        ctx.cites.append(k)
                flush()
                tok = {"t": "cite", "k": keys}
                if opt is not None and opt.strip():
                    tok["note"] = inline(opt, ctx)
                toks.append(tok)
                i = j2; continue
            if cmd == "S":
                buf.append("\u00a7"); i = j; continue
            if cmd == "renewcommand":
                _, j = read_optional(s, j)
                _, j = read_group(s, j)
                _, j = read_group(s, j)
                i = j; continue
            if cmd == "label":
                g, j2 = read_group(s, j)
                ctx.pending_label = (g or "").strip()
                i = j2; continue
            if cmd in DROP_3ARG:
                for _ in range(3):
                    _, j = read_group(s, j)
                i = j; continue
            if cmd in DROP_2ARG:
                for _ in range(2):
                    _, j = read_group(s, j)
                i = j; continue
            if cmd in DROP_1ARG:
                _, j = read_group(s, j)
                i = j; continue
            if cmd in DROP_NOARG:
                i = j; continue
            if cmd in ("item",):
                i = j; continue
            if cmd == "texorpdfstring":
                g1, j2 = read_group(s, j)
                _, j3 = read_group(s, j2)
                sub = inline(g1 or "", ctx)
                flush(); toks.extend(sub); i = j3; continue
            if cmd == "makebox":
                _, j = read_optional(s, j)
                _, j = read_optional(s, j)
                g, j = read_group(s, j)
                sub = inline(g or "", ctx)
                flush(); toks.extend(sub); i = j; continue
            if cmd in ("text", "mbox"):
                g, j2 = read_group(s, j)
                buf.append(g or ""); i = j2; continue
            # unknown macro: keep contents of a following group if present
            g, j2 = read_group(s, j)
            if g is not None:
                sub = inline(g, ctx)
                flush(); toks.extend(sub); i = j2; continue
            i = j; continue

        buf.append(c); i += 1

    flush()
    return toks


def trim_tokens(toks):
    """Trim only the leading and trailing edges; interior spacing is content."""
    while toks and toks[0].get("t") == "text" and not toks[0]["v"].strip():
        toks = toks[1:]
    while toks and toks[-1].get("t") == "text" and not toks[-1]["v"].strip():
        toks = toks[:-1]
    if toks and toks[0].get("t") == "text":
        toks = [dict(toks[0], v=toks[0]["v"].lstrip())] + toks[1:]
    if toks and toks[-1].get("t") == "text":
        toks = toks[:-1] + [dict(toks[-1], v=toks[-1]["v"].rstrip())]
    return [t for t in toks if not (t.get("t") == "text" and t["v"] == "")]


def plain(toks):
    """Token list -> plain string (for TOC / metadata / search index)."""
    out = []
    for t in toks:
        k = t.get("t")
        if k == "text":
            out.append(t["v"])
        elif k == "math":
            out.append(t["v"])
        elif k == "code":
            out.append(t["v"])
        elif k in ("em", "strong", "sc", "link"):
            out.append(plain(t.get("c", [])))
        elif k == "br":
            out.append(" ")
        elif k == "ref":
            out.append((t.get("sep") or "") + (t.get("prefix") or "") + str(t.get("n", "")))
        elif k == "cite":
            out.append("[" + ",".join(str(x) for x in (t.get("n") or [])) + "]")
            if t.get("note"):
                out.append(plain(t["note"]))
    return "".join(out)


# ---------------------------------------------------------------- math layer

MATH_ENVS = {"equation", "equation*", "align", "align*", "gather", "gather*",
             "multline", "multline*", "eqnarray", "eqnarray*", "displaymath",
             "alignat", "alignat*"}


def unwrap_makebox(tex: str) -> str:
    """\\makebox[w][a]{$X$} -> X   (KaTeX has no \\makebox)"""
    out, i = [], 0
    while True:
        m = re.compile(r"\\(?:makebox|framebox|parbox|raisebox)").search(tex, i)
        if not m:
            out.append(tex[i:]); break
        out.append(tex[i:m.start()])
        j = m.end()
        while True:
            opt, j2 = read_optional(tex, j)
            if opt is None:
                break
            j = j2
        g, j3 = read_group(tex, j)
        if g is None:
            i = j; continue
        g = g.strip()
        if g.startswith("$") and g.endswith("$"):
            g = g[1:-1]
        out.append(unwrap_makebox(g))
        i = j3
    return "".join(out)


def clean_math(tex: str) -> str:
    tex = unwrap_makebox(tex)
    tex = re.sub(r"\\label\{[^}]*\}", "", tex)
    tex = re.sub(r"\\nonumber\b", "", tex)
    tex = re.sub(r"\\notag\b", "", tex)
    tex = re.sub(r"\\intertext\{[^}]*\}", "", tex)
    tex = re.sub(r"\\vphantom\{[^}]*\}", "", tex)
    tex = re.sub(r"\\!", "", tex)
    tex = tex.replace("\\displaystyle", "")
    return tex.strip()


def math_from_env(env: str, body: str):
    """Return (tex, numbered)."""
    body = clean_math(body)
    base = env.rstrip("*")
    numbered = not env.endswith("*")
    if base in ("align", "alignat", "eqnarray"):
        tex = "\\begin{aligned}\n" + body + "\n\\end{aligned}"
    elif base == "gather":
        tex = "\\begin{gathered}\n" + body + "\n\\end{gathered}"
    elif base == "multline":
        tex = "\\begin{gathered}\n" + body.replace("\\\\", "\\\\") + "\n\\end{gathered}"
    else:
        tex = body
        if base == "displaymath":
            numbered = False
    return tex, numbered


# ---------------------------------------------------------------- doc model

THEOREM_STYLE = {
    # env -> (display name, counter group)
    "theorem": ("Theorem", "thm"),
    "lemma": ("Lemma", "thm"),
    "proposition": ("Proposition", "thm"),
    "corollary": ("Corollary", "thm"),
    "definition": ("Definition", "thm"),
    "remark": ("Remark", "thm"),
    "postulate": ("Physical Postulate", "post"),
    "principle": ("Closure Principle", "prin"),
    "assumption": ("Modeling Assumption", "asm"),
    "structuralclaim": ("Structural Claim", "sc"),
    "frameworkdef": ("Framework Definition", "fd"),
}

# per-paper overrides taken from each preamble's \newtheorem declarations
PAPER_THEOREMS = {
    "why": {
        "theorem": ("Theorem", "thm"), "lemma": ("Lemma", "thm"),
        "proposition": ("Proposition", "thm"), "corollary": ("Corollary", "thm"),
        "definition": ("Definition", "thm"), "remark": ("Remark", "thm"),
        "postulate": ("Physical Postulate", "thm"), "principle": ("Closure Principle", "thm"),
    },
    "what": {
        "theorem": ("Theorem", "thm"), "lemma": ("Lemma", "thm"),
        "corollary": ("Corollary", "thm"), "definition": ("Definition", "thm"),
        "remark": ("Remark", "thm"),
        "postulate": ("Physical Postulate", "post"),
        "proposition": ("Conditional Physical Proposition", "prop"),
        "assumption": ("Modeling Assumption", "asm"),
        "principle": ("Modeling Convention", "prin"),
    },
    "how": {
        "theorem": ("Theorem", "thm"), "lemma": ("Lemma", "thm"),
        "proposition": ("Proposition", "thm"),
        "corollary": ("Corollary", "thm"), "definition": ("Definition", "thm"),
        "remark": ("Remark", "thm"),
        "postulate": ("Physical Postulate", "post"),
        "structuralclaim": ("Structural Claim", "sc"),
        "assumption": ("Modeling Assumption", "asm"),
        "principle": ("Modeling Convention", "prin"),
        "frameworkdef": ("Framework Definition", "fd"),
    },
    # (display name, counter group, scheme). scheme defaults to per-section
    # "sec.n" when omitted. "alpha" and "H" are global, matching \Alph and Hn.
    "studies-1": {
        "theorem": ("Theorem", "thm"),
        "lemma": ("Lemma", "thm"),
        "corollary": ("Corollary", "thm"),
        "definition": ("Definition", "thm"),
        "remark": ("Remark", "thm"),
        "proposition*": ("Proposition", "thm"),
        "mainthm": ("Theorem", "main", "alpha"),
        "hypothesis": ("Hypothesis", "hyp", "H"),
        "conjecture": ("Conjecture", "conj"),
        "postulate": ("Physical Postulate", "post"),
        "proposition": ("Conditional Physical Proposition", "prop"),
        "assumption": ("Modeling Assumption", "asm"),
        "principle": ("Modeling Convention", "prin"),
    },
}

# cleveref names for Studies I. \cref lowercases; \Cref capitalises the first.
CREF_NAMES = {
    "theorem": ("theorem", "theorems"),
    "lemma": ("lemma", "lemmas"),
    "corollary": ("corollary", "corollaries"),
    "definition": ("definition", "definitions"),
    "remark": ("remark", "remarks"),
    "mainthm": ("theorem", "theorems"),
    "proposition*": ("proposition", "propositions"),
    "proposition": ("proposition", "propositions"),
    "conjecture": ("conjecture", "conjectures"),
    "hypothesis": ("hypothesis", "hypotheses"),
    "postulate": ("postulate", "postulates"),
    "assumption": ("assumption", "assumptions"),
    "principle": ("convention", "conventions"),
    "section": ("section", "sections"),
    "equation": ("equation", "equations"),
    "table": ("table", "tables"),
}

BOX_ENVS = {
    "keyresult": ("Key Result", "key"),
    "reflect": ("Reflection", "reflect"),
    "realization": ("Realization", "realize"),
    "chainbox": ("The Chain", "chain"),
    "keyterms": ("Key Terms", "terms"),
    "excludedclaims": ("Explicitly Not Claimed", "excluded"),
}

LIST_ENVS = {"enumerate", "itemize", "description"}
TABLE_ENVS = {"tabular", "tabularx", "longtable", "tabu", "array"}
FLOAT_ENVS = {"table", "table*", "figure", "figure*", "center", "small",
              "singlespace", "spacing", "adjustbox", "minipage"}


class Doc:
    def __init__(self, pid, ctx):
        self.pid = pid
        self.ctx = ctx
        self.blocks = []
        self.sec = 0
        self.sub = 0
        self.subsub = 0
        self.sec_label = "0"
        self.counters = {}
        self.tablecount = 0
        self.numbered_tables = 0
        self.thm_map = PAPER_THEOREMS[pid]
        self.anchor_seen = {}
        # Letter the appendix only for Studies I. Documents I–III already
        # publish appendix sections in the main numeric sequence.
        self.letter_appendix = pid == "studies-1"
        self.in_appendix = False
        self.app_i = 0
        self.list_depth = 0
        self.enum_last = {}

    def bump(self, group, scheme="section"):
        if scheme == "alpha":
            key = ("alpha", group)
            self.counters[key] = self.counters.get(key, 0) + 1
            return chr(ord("A") + self.counters[key] - 1)
        if scheme == "H":
            key = ("H", group)
            self.counters[key] = self.counters.get(key, 0) + 1
            return "H" + str(self.counters[key])
        sec_key = self.sec_label if self.in_appendix else self.sec
        key = (group, sec_key)
        self.counters[key] = self.counters.get(key, 0) + 1
        return f"{sec_key}.{self.counters[key]}"

    def anchor(self, base):
        base = re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-") or "s"
        k = self.anchor_seen.get(base, 0)
        self.anchor_seen[base] = k + 1
        return base if k == 0 else f"{base}-{k}"

    def add(self, b):
        self.blocks.append(b)
        return b

    def take_label(self, anchor, num, kind):
        lb = self.ctx.pending_label
        self.ctx.pending_label = None
        if lb:
            self.ctx.labels[lb] = {"num": num, "kind": kind, "anchor": anchor, "env": "table"}
        return lb


def split_paragraphs(s):
    return [p for p in re.split(r"\n[ \t]*\n+", s) if p.strip()]


def to_roman(n):
    vals = [(10, "x"), (9, "ix"), (5, "v"), (4, "iv"), (1, "i")]
    out = []
    while n >= 50:
        out.append("l"); n -= 50
    for v, s in vals:
        while n >= v:
            out.append(s); n -= v
    return "".join(out) or "i"


def expand_enum_label(template, n):
    alpha = chr(ord("a") + n - 1) if 1 <= n <= 26 else str(n)
    s = template
    s = re.sub(r"\\Alph\*", alpha.upper(), s)
    s = re.sub(r"\\alph\*", alpha, s)
    s = re.sub(r"\\Roman\*", to_roman(n).upper(), s)
    s = re.sub(r"\\roman\*", to_roman(n), s)
    s = re.sub(r"\\arabic\*", str(n), s)
    s = re.sub(r"\\textbf\{([^{}]*)\}", r"\1", s)
    s = re.sub(r"\\(?:bfseries|mdseries|normalfont|sffamily)\b", "", s)
    s = s.replace("{", "").replace("}", "")
    return s.strip()


def parse_list(body, ctx, doc, ordered):
    items = []
    template, resume = None, False
    if ordered and doc.pid == "studies-1":
        j = 0
        while j < len(body) and body[j] in " \t\n":
            j += 1
        opt, after = read_optional(body, j)
        if opt is not None:
            body = body[after:]
            resume = re.search(r"(?:^|,)\s*resume\b", opt) is not None
            lm = re.search(r"label\s*=\s*([^,\]]+)", opt)
            if lm:
                template = lm.group(1).strip()
    doc.list_depth += 1
    list_level = doc.list_depth
    enum_n = doc.enum_last.get(list_level, 0) if (resume and template) else 0
    try:
        # split on \item at brace depth 0. Studies I also ignores \item inside
        # a nested environment so a list inside a list stays one item. Documents
        # keep the historical split, which their published pages were built from.
        idxs = []
        brace, envd, i, nlen = 0, 0, 0, len(body)
        track_env = doc.pid == "studies-1"
        while i < nlen:
            if body[i] == "\\":
                if track_env and body.startswith("\\begin{", i) and brace == 0:
                    envd += 1
                elif track_env and body.startswith("\\end{", i) and brace == 0 and envd > 0:
                    envd -= 1
                m = re.match(r"\\item\b", body[i:])
                if m and brace == 0 and envd == 0:
                    idxs.append(i)
                    i += m.end(); continue
                i += 2; continue
            if body[i] == "{":
                brace += 1
            elif body[i] == "}":
                brace -= 1
            i += 1
        for k, st in enumerate(idxs):
            en = idxs[k+1] if k + 1 < len(idxs) else nlen
            chunk = body[st:en]
            chunk = re.sub(r"^\\item\b", "", chunk.strip())
            lbl, rest = read_optional(chunk, 0)
            chunk = chunk[rest:] if lbl is not None else chunk
            sub = parse_body(chunk, ctx, doc, inside=True)
            item = {"label": lbl, "blocks": sub}
            if template:
                enum_n += 1
                item["marker"] = expand_enum_label(template, enum_n)
            items.append(item)
        if template:
            doc.enum_last[list_level] = enum_n
    finally:
        doc.list_depth -= 1
    return {"kind": "list", "ordered": ordered, "items": items}


def parse_table(body, ctx, doc, caption=None, colspec="", number=True):
    # A \midrule that follows a \toprule marks the end of the header rows.
    head_src = None
    tm = re.search(r"\\toprule\b", body)
    mm = re.search(r"\\midrule\b", body)
    if tm and mm and mm.start() > tm.start():
        head_src = body[tm.end():mm.start()]
        body = body[mm.end():]
    body = re.sub(r"\\(toprule|midrule|bottomrule|hline|endhead|endfoot|endfirsthead|endlastfoot)\b", "", body)
    if head_src is not None:
        head_src = re.sub(r"\\(toprule|midrule|bottomrule|hline)\b", "", head_src)
    body = re.sub(r"\\cmidrule(\([^)]*\))?(\{[^}]*\})?", "", body)
    body = re.sub(r"\\caption\{", "\\\\CAPTIONDROP{", body)
    def to_rows(src):
        rows, cur, cell = [], [], []
        depth, i, n = 0, 0, len(src)
        def push_cell():
            cur.append("".join(cell).strip()); cell.clear()
        while i < n:
            c = src[i]
            if c == "\\":
                if src.startswith("\\\\", i):
                    push_cell(); rows.append(cur[:]); cur.clear(); i += 2
                    _, i = read_optional(src, i)
                    continue
                cell.append(src[i:i+2]); i += 2; continue
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
            if c == "&" and depth == 0:
                push_cell(); i += 1; continue
            cell.append(c); i += 1
        push_cell()
        if any(x.strip() for x in cur):
            rows.append(cur)
        return [r for r in rows if any(x.strip() for x in r)]

    rows = to_rows(body)
    head_rows = to_rows(head_src) if head_src is not None else []
    if not rows and not head_rows:
        return None

    def cells(r):
        return [inline(re.sub(r"\\multicolumn\{\d+\}\{[^}]*\}", "", x), ctx) for x in r]

    if head_rows:
        head = cells(head_rows[0])
        data = [cells(r) for r in head_rows[1:] + rows]
    else:
        header = rows[0]
        is_header = len(rows) > 1 and all(("\\textbf" in c or not c.strip()) for c in header)
        head = cells(header) if is_header else None
        data = [cells(r) for r in (rows[1:] if is_header else rows)]
    ncol = max([len(head or [])] + [len(r) for r in data] + [1])
    doc.tablecount += 1
    if number:
        doc.numbered_tables += 1
        num = str(doc.numbered_tables)
        anc = f"table-{num}"
    else:
        # A bare tabular is not a LaTeX float, so it must not consume Table 1, 2, …
        num = ""
        anc = f"table-u{doc.tablecount}"
    doc.take_label(anc, num, "Table")
    return {"kind": "table", "num": num, "anchor": anc, "head": head, "rows": data,
            "cols": ncol, "caption": caption}


def parse_body(s, ctx, doc, inside=False):
    """Parse a LaTeX fragment into a block list."""
    blocks = []
    i, n = 0, len(s)
    buf_start = 0

    def flush_text(end):
        chunk = s[buf_start:end]
        if not chunk.strip():
            return
        for para in split_paragraphs(chunk):
            # bare display math \[ ... \]
            pieces = re.split(r"(\\\[[\s\S]*?\\\])", para)
            for pc in pieces:
                if not pc.strip():
                    continue
                if pc.startswith("\\["):
                    tex = clean_math(pc[2:-2])
                    blocks.append({"kind": "math", "tex": tex, "num": None})
                else:
                    toks = trim_tokens(inline(pc, ctx))
                    if plain(toks).strip():
                        blocks.append({"kind": "paragraph", "c": toks})

    while i < n:
        m = re.compile(r"\\(begin|section|subsection|subsubsection|paragraph|bibitem|appendix)\b\*?").search(s, i)
        if not m:
            break
        cmd = m.group(1)
        star = s[m.start():m.end()].endswith("*")

        if cmd == "appendix":
            flush_text(m.start())
            if doc.letter_appendix:
                doc.in_appendix = True
                doc.app_i = 0
            i = m.end(); buf_start = i; continue

        if cmd in ("section", "subsection", "subsubsection", "paragraph"):
            flush_text(m.start())
            title_raw, j = read_group(s, m.end())
            title_raw = title_raw or ""
            toks = inline(title_raw, ctx)
            lvl = {"section": 1, "subsection": 2, "subsubsection": 3, "paragraph": 4}[cmd]
            num = None
            if not star and lvl <= 3:
                if lvl == 1 and doc.in_appendix:
                    doc.app_i += 1
                    doc.sec_label = chr(ord("A") + doc.app_i - 1)
                    doc.sub = 0; doc.subsub = 0
                    num = doc.sec_label
                elif lvl == 1:
                    doc.sec += 1; doc.sub = 0; doc.subsub = 0
                    num = str(doc.sec)
                    doc.sec_label = num
                elif lvl == 2:
                    doc.sub += 1; doc.subsub = 0
                    num = f"{doc.sec_label}.{doc.sub}"
                else:
                    doc.subsub += 1
                    num = f"{doc.sec_label}.{doc.sub}.{doc.subsub}"
            elif star and lvl == 1:
                doc.sec = doc.sec  # unnumbered front matter
            anc = doc.anchor((num + "-" if num else "") + plain(toks)[:48])
            # a \label immediately after the heading
            look = s[j:j+220]
            lm = re.match(r"\s*\\label\{([^}]*)\}", look)
            if lm:
                ctx.labels[lm.group(1)] = {"num": num or "", "kind": "Section", "anchor": anc, "env": "section"}
                j += lm.end()
            text = plain(toks)
            if doc.pid == "studies-1":
                text = (text.replace("\\Sigma_0", "\u03a3\u2080")
                            .replace("\\Sigma", "\u03a3")
                            .replace("SO^+(1,3)", "SO\u207a(1,3)"))
            blocks.append({"kind": "heading", "level": lvl, "num": num,
                           "anchor": anc, "c": toks, "text": text})
            i = j; buf_start = j; continue

        if cmd == "bibitem":
            flush_text(m.start())
            _, j = read_optional(s, m.end())
            key, j = read_group(s, j)
            nxt = re.compile(r"\\bibitem\b").search(s, j)
            end = nxt.start() if nxt else n
            txt = s[j:end]
            blocks.append({"kind": "bib", "key": (key or "").strip(),
                           "c": inline(txt, ctx)})
            i = end; buf_start = end; continue

        # \begin{env}
        env_name, j = read_group(s, m.end())
        if env_name is None:
            i = m.end(); continue
        env = env_name.strip()
        inner_end, after = find_env_end(s, env, j)
        body = s[j:inner_end]
        flush_text(m.start())

        blk = handle_env(env, body, ctx, doc)
        if blk is not None:
            if isinstance(blk, list):
                blocks.extend(blk)
            else:
                blocks.append(blk)
        i = after; buf_start = after

    flush_text(n)
    return blocks


def split_align_rows(body: str):
    """Split an align body on top-level \\\\ (outside braces and nested environments)."""
    rows, cur, depth, envd, i, n = [], [], 0, 0, 0, len(body)
    while i < n:
        c = body[i]
        if c == "\\":
            if body.startswith("\\\\", i) and depth == 0 and envd == 0:
                rows.append("".join(cur)); cur = []
                i += 2
                m = re.match(r"\s*\[[^\]]*\]", body[i:])   # optional \\[len] spacing
                if m:
                    i += m.end()
                continue
            if body.startswith("\\begin{", i):
                envd += 1
            elif body.startswith("\\end{", i):
                envd -= 1
            cur.append(body[i:i+2]); i += 2; continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
        cur.append(c); i += 1
    rows.append("".join(cur))
    return [r for r in rows if r.strip()]


def numbered_align_block(body: str, ctx):
    """LaTeX numbers every row of a plain `align` unless it carries \\nonumber/\\notag.
    Mirror that: one block, one explicit \\tag per numbered row, so the web
    equation numbers match the PDF exactly.  KaTeX draws the tags itself."""
    rows = split_align_rows(body)
    tagged, plain_rows, nums, numbered_rows, anchor = [], [], [], [], None
    for r in rows:
        skip = re.search(r"\\(nonumber|notag)\b", r) is not None
        lm = re.search(r"\\label\{([^}]*)\}", r)
        cleaned = clean_math(r)
        plain_rows.append(cleaned)
        if skip:
            tagged.append(cleaned + " \\notag")
            continue
        ctx.eqcount += 1
        num = str(ctx.eqcount)
        row_anchor = f"eq-{num}"
        nums.append(num)
        numbered_rows.append(cleaned)
        if anchor is None:
            anchor = row_anchor
        if lm:
            ctx.labels[lm.group(1)] = {"num": num, "kind": "Equation", "anchor": row_anchor, "env": "equation"}
        tagged.append(cleaned + " \\tag{" + num + "}")
    tex = "\\begin{align}\n" + " \\\\\n".join(tagged) + "\n\\end{align}"
    copy = "\\begin{aligned}\n" + " \\\\\n".join(plain_rows) + "\n\\end{aligned}"
    return {"kind": "math", "tex": tex, "copy": copy, "num": None,
            "nums": nums, "rows": list(plain_rows), "numbered_rows": numbered_rows,
            "anchor": anchor}


def handle_env(env, body, ctx, doc):
    base = env.rstrip("*")

    if env == "align" and doc.pid in ("how", "studies-1"):
        return numbered_align_block(body, ctx)

    if env in MATH_ENVS or base in ("displaymath",):
        lm = re.search(r"\\label\{([^}]*)\}", body)
        tex, numbered = math_from_env(env, body)
        num = None
        if numbered:
            ctx.eqcount += 1
            num = str(ctx.eqcount)
        anc = f"eq-{num}" if num else None
        if lm and num:
            ctx.labels[lm.group(1)] = {"num": num, "kind": "Equation", "anchor": anc, "env": "equation"}
        return {"kind": "math", "tex": tex, "num": num, "anchor": anc}

    if base in ("gathered", "aligned", "split", "cases", "pmatrix", "bmatrix"):
        tex = "\\begin{" + base + "}" + clean_math(body) + "\\end{" + base + "}"
        return {"kind": "math", "tex": tex, "num": None}

    if env in LIST_ENVS:
        return parse_list(body, ctx, doc, ordered=(env == "enumerate"))

    if env in doc.thm_map:
        spec = doc.thm_map[env]
        name, group = spec[0], spec[1]
        scheme = spec[2] if len(spec) > 2 else "section"
        title, k = read_optional(body, 0)
        rest = body[k:]
        lm = re.match(r"\s*\\label\{([^}]*)\}", rest)
        lab = None
        if lm:
            lab = lm.group(1); rest = rest[lm.end():]
        else:
            lm2 = re.search(r"\\label\{([^}]*)\}", rest[:400])
            if lm2:
                lab = lm2.group(1)
                rest = rest[:lm2.start()] + rest[lm2.end():]
        num = doc.bump(group, scheme)
        slug = (env[:-1] + "-star") if env.endswith("*") else env
        anc = f"{slug}-{num.replace('.', '-')}"
        if lab:
            ctx.labels[lab] = {"num": num, "kind": name, "anchor": anc, "env": env}
        sub = parse_body(rest, ctx, doc, inside=True)
        return {"kind": "theorem", "env": env, "name": name, "num": num,
                "anchor": anc, "title": inline(title, ctx) if title else None,
                "blocks": sub}

    if env == "proof":
        title, k = read_optional(body, 0)
        sub = parse_body(body[k:], ctx, doc, inside=True)
        return {"kind": "proof", "title": inline(title, ctx) if title else None,
                "blocks": sub}

    if env in BOX_ENVS:
        name, slug = BOX_ENVS[env]
        title, k = read_optional(body, 0)
        sub = parse_body(body[k:], ctx, doc, inside=True)
        return {"kind": "box", "variant": slug, "name": name,
                "title": inline(title, ctx) if title else None, "blocks": sub}

    if env == "CanonAbstract":
        return {"kind": "abstract", "c": inline(body, ctx)}

    if env == "thebibliography":
        _, k = read_group(body, 0)
        sub = parse_body(body[k:], ctx, doc, inside=True)
        # The reader template renders its own "References" section (id="references")
        # from the `bibliography` list, so no heading block is emitted here.
        return sub

    if env in ("table", "table*", "figure", "figure*", "longtable"):
        _, k = read_optional(body, 0)
        cap = None
        cm = re.search(r"\\caption\{", body)
        if cm:
            e = match_brace(body, cm.end() - 1)
            cap = inline(body[cm.end():e-1], ctx)
            body = body[:cm.start()] + body[e:]
        lm = re.search(r"\\label\{([^}]*)\}", body)
        if lm:
            ctx.pending_label = lm.group(1)
            body = body[:lm.start()] + body[lm.end():]
        if env == "longtable":
            return parse_table(body, ctx, doc, caption=cap)
        inner = None
        for te in TABLE_ENVS | {"longtable"}:
            tm = re.search(r"\\begin\{" + te + r"\}", body)
            if tm:
                ie, _ = find_env_end(body, te, tm.end())
                rest = body[tm.end():ie]
                _, r2 = read_optional(rest, 0)
                _, r3 = read_group(rest, r2)   # width for tabularx
                spec, r4 = read_group(rest, r3)
                if te in ("tabularx", "tabu"):
                    inner = rest[r4:]
                else:
                    _, r2b = read_optional(rest, 0)
                    spec2, r3b = read_group(rest, r2b)
                    inner = rest[r3b:]
                break
        if inner is None:
            sub = parse_body(body, ctx, doc, inside=True)
            return sub
        return parse_table(inner, ctx, doc, caption=cap)

    if env in TABLE_ENVS:
        _, r2 = read_optional(body, 0)
        _, r3 = read_group(body, r2)
        # A bare tabular is not a numbered float. Studies I has one (the
        # hypothesis matrix); counting it would renumber the captioned tables.
        # Documents I–III number every tabular, and that published numbering stays.
        number = doc.pid != "studies-1"
        return parse_table(body[r3:], ctx, doc, number=number)

    if env in FLOAT_ENVS or env in ("quote", "quotation", "abstract", "flushleft", "flushright"):
        _, k = read_optional(body, 0)
        return parse_body(body[k:], ctx, doc, inside=True)

    # unknown environment: parse contents
    return parse_body(body, ctx, doc, inside=True)


# ---------------------------------------------------------------- driver

def extract_meta(pre):
    def get(name):
        m = re.search(r"\\newcommand\{\\" + name + r"\}\{", pre)
        if not m:
            return ""
        e = match_brace(pre, m.end() - 1)
        return pre[m.end():e-1]
    return {k: get(k) for k in
            ["CanonStage", "CanonGenre", "CanonTitle", "CanonSubtitle",
             "CanonShortTitle", "CanonDeck"]}


def extract_macros(pre):
    macros = {}
    for m in re.finditer(r"\\providecommand\{(\\[a-zA-Z]+)\}\{", pre):
        e = match_brace(pre, m.end() - 1)
        macros[m.group(1)] = pre[m.end():e-1]
    return macros


def cref_words(info):
    env = info.get("env") or ""
    if env in CREF_NAMES:
        return CREF_NAMES[env]
    kind = (info.get("kind") or "reference").lower()
    return (kind, kind + "s")


def format_cref(group, ctx):
    """cleveref run: 'propositions 3.1 and 3.2' / 'Theorems A, B and C'."""
    infos = []
    for t in group:
        info = ctx.labels.get(t["k"])
        if info:
            t["n"] = info["num"]
            t["a"] = info["anchor"]
            t["kind"] = info["kind"]
            if info.get("env") == "equation":
                t["eq"] = True
        else:
            t["n"] = "?"
            info = {"num": "?", "kind": "?", "env": ""}
        infos.append(info)
    runs = []
    for t, info in zip(group, infos):
        sing, plur = cref_words(info)
        if runs and runs[-1][0] == sing:
            runs[-1][2].append(t)
        else:
            runs.append([sing, plur, [t]])
    cap = group[0].get("cref") == "C"
    for run_i, (sing, plur, toks) in enumerate(runs):
        name = plur if len(toks) > 1 else sing
        if run_i == 0 and cap:
            name = name[:1].upper() + name[1:]
        for i, t in enumerate(toks):
            if i == 0:
                t["sep"] = "" if run_i == 0 else " and "
                t["prefix"] = name + " "
            elif i == len(toks) - 1:
                t["sep"] = " and "
                t["prefix"] = ""
            else:
                t["sep"] = ", "
                t["prefix"] = ""


def resolve_refs(node, ctx):
    """Walk the tree and attach resolved numbers to ref/cite tokens."""
    if isinstance(node, list):
        i = 0
        while i < len(node):
            t = node[i]
            if isinstance(t, dict) and t.get("t") == "ref" and t.get("cref"):
                mark = t.get("cref")
                j = i + 1
                while j < len(node) and isinstance(node[j], dict) and node[j].get("t") == "ref" and node[j].get("cref") == mark:
                    j += 1
                format_cref(node[i:j], ctx)
                i = j
                continue
            resolve_refs(t, ctx)
            i += 1
        return
    if not isinstance(node, dict):
        return
    if node.get("t") == "ref":
        info = ctx.labels.get(node["k"])
        if info:
            node["n"] = info["num"]
            node["a"] = info["anchor"]
            node["kind"] = info["kind"]
        else:
            node["n"] = "?"
    if node.get("t") == "cite":
        node["n"] = [ctx.bibindex.get(k, "?") for k in node["k"]]
    for v in node.values():
        if isinstance(v, (list, dict)):
            resolve_refs(v, ctx)


def build_toc(blocks):
    toc = []
    for b in blocks:
        if b.get("kind") == "heading" and b.get("level", 9) <= 2:
            toc.append({"level": b["level"], "num": b.get("num"),
                        "anchor": b["anchor"], "text": b["text"]})
    return toc


def collect_search(blocks, out):
    for b in blocks:
        k = b.get("kind")
        if k == "heading":
            out.append(b["text"])
        elif k in ("paragraph", "abstract"):
            out.append(plain(b["c"]))
        elif k in ("theorem", "proof", "box", "list"):
            if b.get("title"):
                out.append(plain(b["title"]))
            for sub in b.get("blocks", []) or []:
                collect_search([sub], out)
            for it in b.get("items", []) or []:
                collect_search(it["blocks"], out)
    return out


def main():
    result = {}
    for pid, fname in PAPERS:
        raw = open(os.path.join(SRC, fname), encoding="utf-8").read().replace("\r\n", "\n")
        raw = strip_comments(raw)
        pre, body = raw.split("\\begin{document}", 1)
        body = body.split("\\end{document}")[0]

        meta = extract_meta(pre)
        macros = extract_macros(pre)

        ctx = Ctx()
        ctx.named_cref = pid == "studies-1"
        doc = Doc(pid, ctx)

        # pre-scan bibliography so \cite numbers are stable and in bib order
        bm = re.search(r"\\begin\{thebibliography\}", body)
        if bm:
            ie, _ = find_env_end(body, "thebibliography", bm.end())
            for k, key in enumerate(re.findall(r"\\bibitem(?:\[[^\]]*\])?\{([^}]*)\}",
                                               body[bm.end():ie])):
                ctx.bibindex[key.strip()] = k + 1

        blocks = parse_body(body, ctx, doc)

        abstract = None
        rest = []
        for b in blocks:
            if b.get("kind") == "abstract" and abstract is None:
                abstract = b["c"]
            else:
                rest.append(b)
        blocks = rest

        resolve_refs(blocks, ctx)
        resolve_refs(abstract or [], ctx)
        for f in ctx.footnotes:
            resolve_refs(f, ctx)

        bib = [{"n": ctx.bibindex.get(b["key"], 0), "key": b["key"], "c": b["c"]}
               for b in blocks if b.get("kind") == "bib"]
        bib.sort(key=lambda x: x["n"])
        blocks = [b for b in blocks if b.get("kind") != "bib"]

        previews = build_previews(blocks)
        index = build_index(pid, blocks)
        if bib:   # the reader template's own References section stays searchable
            index.append({"p": pid, "a": "references", "k": "Section", "n": "",
                          "t": "References", "s": "References", "x": ""})

        stats = {
            "sections": sum(1 for b in blocks if b.get("kind") == "heading" and b["level"] == 1)
                        + (1 if bib else 0),   # + the template-rendered References section
            "equations": ctx.eqcount,
            "theorems": count_kind(blocks, "theorem"),
            "tables": doc.tablecount,
            "references": len(bib),
            "words": len(" ".join(collect_search(blocks, [])).split()),
        }

        result[pid] = {
            "meta": meta,
            "macros": macros,
            "abstract": abstract or [],
            "blocks": blocks,
            "toc": build_toc(blocks),
            "bibliography": bib,
            "footnotes": ctx.footnotes,
            "previews": previews,
            "index": index,
            "stats": stats,
        }
        print(f"[{pid}] {stats}")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, separators=(",", ":"))
    print("wrote", OUT, os.path.getsize(OUT), "bytes")

    # the command-palette index is a small standalone file, fetched on demand
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    search = [e for pid, _ in PAPERS for e in result[pid]["index"]]
    spath = os.path.join(root, "public", "search.json")
    with open(spath, "w", encoding="utf-8") as f:
        json.dump(search, f, ensure_ascii=False, separators=(",", ":"))
    print("wrote", spath, len(search), "entries")


def excerpt(blocks, limit=210):
    out = []
    for b in blocks:
        k = b.get("kind")
        if k == "paragraph":
            out.append(plain(b["c"]))
        elif k == "math":
            out.append(" ")
        elif k in ("list",):
            for it in b.get("items", []):
                out.append(excerpt(it["blocks"], 80))
        if len(" ".join(out)) > limit:
            break
    t = re.sub(r"\s+", " ", " ".join(out)).strip()
    return (t[:limit].rstrip() + "\u2026") if len(t) > limit else t


def excerpt_tokens(blocks, limit=220):
    """Collect inline tokens from the first paragraphs, truncated to ~limit chars."""
    out, used = [], 0
    for b in blocks:
        k = b.get("kind")
        toks = None
        if k == "paragraph":
            toks = b["c"]
        elif k == "list":
            toks = []
            for it in b.get("items", []):
                toks += excerpt_tokens(it["blocks"], 90) + [{"t": "text", "v": " "}]
        if not toks:
            continue
        if out:
            out.append({"t": "text", "v": " "})
        for t in toks:
            ln = len(plain([t]))
            if used + ln > limit:
                if t.get("t") == "text":
                    out.append({"t": "text", "v": t["v"][:max(0, limit - used)].rstrip() + "\u2026"})
                else:
                    out.append({"t": "text", "v": "\u2026"})
                return out
            out.append(t); used += ln
    return out


def build_previews(blocks, acc=None):
    """anchor -> short preview card for cross-reference hovers."""
    if acc is None:
        acc = {}
    for b in blocks:
        k = b.get("kind")
        if k == "theorem":
            acc[b["anchor"]] = {
                "kind": b["name"], "num": b["num"],
                "title": b.get("title") or [],
                "text": excerpt_tokens(b["blocks"]),
            }
        elif k == "table" and b.get("anchor"):
            acc[b["anchor"]] = {"kind": "Table", "num": b["num"],
                                "title": b.get("caption") or [], "text": []}
        elif k == "heading":
            acc[b["anchor"]] = {"kind": "Section", "num": b.get("num") or "",
                                "title": [{"t": "text", "v": b["text"]}], "text": []}
        for sub in b.get("blocks", []) or []:
            build_previews([sub], acc)
        for it in b.get("items", []) or []:
            build_previews(it["blocks"], acc)
    return acc


def build_index(pid, blocks):
    """Flat search index across headings, theorems and numbered equations."""
    out, section = [], ""
    def walk(bs):
        nonlocal section
        for b in bs:
            k = b.get("kind")
            if k == "heading":
                if b.get("level") == 1:
                    section = b["text"]
                out.append({"p": pid, "a": b["anchor"], "k": "Section",
                            "n": b.get("num") or "", "t": b["text"], "s": section,
                            "x": ""})
            elif k == "theorem":
                out.append({"p": pid, "a": b["anchor"], "k": b["name"], "n": b["num"],
                            "t": plain(b["title"]) if b.get("title") else b["name"],
                            "s": section, "x": excerpt(b["blocks"], 150)})
            elif k == "math" and b.get("nums"):
                # `rows` keeps every align line, including \\nonumber/\\notag.
                # Numbers line up only with the numbered lines, in that order.
                src = b.get("numbered_rows") or b["rows"]
                for n_, r_ in zip(b["nums"], src):
                    out.append({"p": pid, "a": f"eq-{n_}", "k": "Equation", "n": n_,
                                "t": "Equation " + n_, "s": section,
                                "x": re.sub(r"\s+", " ", r_.replace("&", "")).strip()[:90]})
            elif k == "math" and b.get("num"):
                out.append({"p": pid, "a": b["anchor"], "k": "Equation", "n": b["num"],
                            "t": "Equation " + b["num"], "s": section,
                            "x": b["tex"][:90]})
            elif k == "table" and b.get("anchor"):
                out.append({"p": pid, "a": b["anchor"], "k": "Table", "n": b["num"],
                            "t": plain(b.get("caption") or []) or ("Table " + b["num"]),
                            "s": section, "x": ""})
            elif k == "box" and b.get("variant") in ("key", "excluded"):
                out.append({"p": pid, "a": "", "k": b["name"], "n": "",
                            "t": plain(b["title"]) if b.get("title") else b["name"],
                            "s": section, "x": excerpt(b["blocks"], 150)})
            for sub in b.get("blocks", []) or []:
                walk([sub])
            for it in b.get("items", []) or []:
                walk(it["blocks"])
    walk(blocks)
    return [e for e in out if e["a"]]


def count_kind(blocks, kind):
    c = 0
    for b in blocks:
        if b.get("kind") == kind:
            c += 1
        for sub in b.get("blocks", []) or []:
            c += count_kind([sub], kind)
        for it in b.get("items", []) or []:
            c += count_kind(it["blocks"], kind)
    return c


if __name__ == "__main__":
    main()

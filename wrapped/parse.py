#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser do export do WhatsApp -> data.json para a página Wrapped.

Formato real de uma mensagem:
    [DD/MM/YYYY, HH:MM:SS] Remetente: texto
Linhas que não casam com esse padrão são continuação da mensagem anterior
(inclui conversas encaminhadas/coladas, que usam outro formato de data).

Fuso: os timestamps do arquivo estão em UTC+1 (Markos). A Iris está no
Brasil (UTC-3), 4h atrás. Geramos histogramas de hora nos dois fusos.
"""
import json
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timedelta

CHAT = "_chat.txt"
OUT = "data.json"

# Markos = UTC+1, Iris = UTC-3  ->  diferença de 4 horas
HOUR_SHIFT_TO_IRIS = -4

MSG_RE = re.compile(
    r"^\[(\d{2})/(\d{2})/(\d{4}), (\d{2}):(\d{2}):(\d{2})\] (.*?): (.*)$"
)
LRM = "‎"  # marca invisível que prefixa mídia/eventos

MEDIA_RE = re.compile(r"\b(image|sticker|video|audio|GIF|document|Contact card) omitted\b")

# Faixas unicode de emoji (cobre a maioria do uso real)
EMOJI_RE = re.compile(
    "[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF✀-➿☀-⛿\U00002B00-\U00002BFF\U0001F000-\U0001F0FF←-⇿⌀-⏿]"
)
HEART_RE = re.compile("[❤\U0001F90D\U0001F90E\U0001F493-\U0001F49F\U0001F90C\U0001F970]")

STOPWORDS = set("""
a o e que de do da em um uma os as no na pra pro por com se me te eu voce você
não nao sim já ja mas ou as ao aos das dos é eh ne né tá ta to tô t" lá la aí ai
pq porque so só vai vou ta tava ser tem ter to isso esse essa este esta ele ela
meu minha seu sua nos nós vc vcs aqui agora hoje quando como mais menos muito
mt mto tbm também tambem tudo nada todo toda bem bom boa pode posso quer quero
foi era estar está esta esse coisa fica vc q d p n tb dq sei la
para pelo pela https http www com br net the and you for
""".split())

# mensagens de sistema do WhatsApp (não contam como mensagem real)
SYSTEM_RE = re.compile(
    r"end-to-end encrypted|This message was deleted|You deleted this message|"
    r"changed the subject|changed this group|added you",
    re.IGNORECASE,
)
URL_RE = re.compile(r"https?://\S+|www\.\S+")


def strip_accents_lower(s):
    s = s.lower()
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def norm_sender(raw):
    if raw == "Markos":
        return "markos"
    if raw.startswith("Iris"):
        return "iris"
    return None  # remetente desconhecido (forward) -> ignora


def main():
    with open(CHAT, encoding="utf-8") as f:
        raw_lines = f.readlines()

    messages = []  # dicts: dt, sender, text, is_media, media_type
    cur = None
    for line in raw_lines:
        line = line.rstrip("\n").replace(LRM, "")
        m = MSG_RE.match(line)
        if m:
            d, mo, y, hh, mm, ss, sender, text = m.groups()
            who = norm_sender(sender)
            if who is None:
                # linha com timestamp mas remetente fora do casal: anexa ao anterior
                if cur:
                    cur["text"] += "\n" + line
                continue
            if cur:
                messages.append(cur)
            dt = datetime(int(y), int(mo), int(d), int(hh), int(mm), int(ss))
            cur = {"dt": dt, "sender": who, "text": text}
        else:
            if cur:
                cur["text"] += "\n" + line
    if cur:
        messages.append(cur)

    # remove mensagens de sistema (aviso de criptografia, apagadas, etc.)
    messages = [m for m in messages if not SYSTEM_RE.search(m["text"])]

    # classifica mídia
    for msg in messages:
        mt = MEDIA_RE.search(msg["text"])
        msg["is_media"] = bool(mt)
        msg["media_type"] = mt.group(1) if mt else None

    total = len(messages)
    by_person = Counter(m["sender"] for m in messages)

    # palavras
    word_count = {"markos": 0, "iris": 0}
    word_freq = Counter()
    char_count = {"markos": 0, "iris": 0}
    for m in messages:
        if m["is_media"]:
            continue
        char_count[m["sender"]] += len(m["text"])
        clean = URL_RE.sub(" ", m["text"])
        for w in re.findall(r"[a-zA-ZÀ-ÿ]+", clean):
            word_count[m["sender"]] += 1
            wl = strip_accents_lower(w)
            if len(wl) >= 3 and wl not in STOPWORDS:
                word_freq[wl] += 1

    # datas / atividade
    day_counts = Counter(m["dt"].date().isoformat() for m in messages)
    month_counts = Counter(m["dt"].strftime("%Y-%m") for m in messages)
    weekday_counts = Counter(m["dt"].weekday() for m in messages)  # 0=seg

    # histograma de hora (markos UTC+1) e iris (UTC-3)
    hour_markos = [0] * 24
    hour_iris = [0] * 24
    for m in messages:
        h = m["dt"].hour
        hour_markos[h] += 1
        hour_iris[(h + HOUR_SHIFT_TO_IRIS) % 24] += 1

    # streak de dias consecutivos com conversa
    days_sorted = sorted(datetime.fromisoformat(d).date() for d in day_counts)
    longest_streak = cur_streak = 1 if days_sorted else 0
    streak_end = streak_start = days_sorted[0] if days_sorted else None
    best_start = best_end = streak_start
    for i in range(1, len(days_sorted)):
        if (days_sorted[i] - days_sorted[i - 1]).days == 1:
            cur_streak += 1
            if cur_streak > longest_streak:
                longest_streak = cur_streak
                best_end = days_sorted[i]
                best_start = days_sorted[i - cur_streak + 1]
        else:
            cur_streak = 1

    # quem manda a primeira mensagem do dia (madrugador)
    first_of_day = {}
    for m in sorted(messages, key=lambda x: x["dt"]):
        dkey = m["dt"].date().isoformat()
        if dkey not in first_of_day:
            first_of_day[dkey] = m["sender"]
    first_text_counts = Counter(first_of_day.values())

    # tempo de resposta (troca de remetente, gap < 6h)
    resp_times = {"markos": [], "iris": []}
    sm = sorted(messages, key=lambda x: x["dt"])
    for i in range(1, len(sm)):
        if sm[i]["sender"] != sm[i - 1]["sender"]:
            gap = (sm[i]["dt"] - sm[i - 1]["dt"]).total_seconds()
            if 0 < gap < 6 * 3600:
                resp_times[sm[i]["sender"]].append(gap)

    def median(xs):
        if not xs:
            return 0
        xs = sorted(xs)
        n = len(xs)
        return xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2

    # emojis
    emoji_total = Counter()
    emoji_by_person = {"markos": Counter(), "iris": Counter()}
    heart_count = {"markos": 0, "iris": 0}
    for m in messages:
        for e in EMOJI_RE.findall(m["text"]):
            emoji_total[e] += 1
            emoji_by_person[m["sender"]][e] += 1
        heart_count[m["sender"]] += len(HEART_RE.findall(m["text"]))

    # palavras românticas / marcantes
    def count_phrase(phrase):
        pat = re.compile(r"\b" + re.escape(phrase) + r"\b", re.IGNORECASE)
        c = {"markos": 0, "iris": 0}
        for m in messages:
            c[m["sender"]] += len(pat.findall(strip_accents_lower(m["text"])))
        return c

    te_amo = count_phrase("te amo")
    amor = count_phrase("amor")
    saudade = count_phrase("saudade")
    love = count_phrase("love")

    # risadas (kk+, rs, haha)
    laugh_re = re.compile(r"(k{2,}|rs{2,}|(ha){2,}|huehue)", re.IGNORECASE)
    laughs = {"markos": 0, "iris": 0}
    for m in messages:
        if laugh_re.search(m["text"]):
            laughs[m["sender"]] += 1

    # bom dia / boa noite
    bomdia = count_phrase("bom dia")
    boanoite = count_phrase("boa noite")

    # mídia por tipo e por pessoa
    media_by_type = Counter(m["media_type"] for m in messages if m["is_media"])
    media_by_person = defaultdict(lambda: Counter())
    for m in messages:
        if m["is_media"]:
            media_by_person[m["sender"]][m["media_type"]] += 1

    # mensagem mais longa (texto)
    longest_msg = max(
        (m for m in messages if not m["is_media"]),
        key=lambda x: len(x["text"]),
        default=None,
    )

    # mensagens de madrugada (0h-5h, fuso markos) por pessoa
    madrugada = {"markos": 0, "iris": 0}
    for m in messages:
        if 0 <= m["dt"].hour < 5:
            madrugada[m["sender"]] += 1

    first_msg = sm[0]
    last_msg = sm[-1]
    span_days = (last_msg["dt"].date() - first_msg["dt"].date()).days + 1

    PT_WD = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

    data = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "names": {"markos": "Markos", "iris": "Iris"},
        "timezone_note": "Horários no arquivo em UTC+1 (Markos). Iris em UTC-3 (Brasil), 4h atrás.",
        "totals": {
            "messages": total,
            "by_person": dict(by_person),
            "words": word_count,
            "words_total": sum(word_count.values()),
            "chars": char_count,
            "span_days": span_days,
            "active_days": len(day_counts),
            "avg_per_day": round(total / max(len(day_counts), 1), 1),
        },
        "range": {
            "first": first_msg["dt"].isoformat(),
            "last": last_msg["dt"].isoformat(),
            "first_message": {
                "sender": first_msg["sender"],
                "text": first_msg["text"][:280],
                "dt": first_msg["dt"].isoformat(),
            },
        },
        "busiest_day": {
            "date": day_counts.most_common(1)[0][0],
            "count": day_counts.most_common(1)[0][1],
        },
        "by_month": dict(sorted(month_counts.items())),
        "by_weekday": {PT_WD[k]: weekday_counts.get(k, 0) for k in range(7)},
        "hour_markos": hour_markos,
        "hour_iris": hour_iris,
        "streak": {
            "days": longest_streak,
            "start": best_start.isoformat() if best_start else None,
            "end": best_end.isoformat() if best_end else None,
        },
        "first_text_of_day": dict(first_text_counts),
        "response_seconds": {
            "markos_median": round(median(resp_times["markos"])),
            "iris_median": round(median(resp_times["iris"])),
            "markos_avg": round(sum(resp_times["markos"]) / max(len(resp_times["markos"]), 1)),
            "iris_avg": round(sum(resp_times["iris"]) / max(len(resp_times["iris"]), 1)),
        },
        "emojis": {
            "top": emoji_total.most_common(12),
            "markos": emoji_by_person["markos"].most_common(6),
            "iris": emoji_by_person["iris"].most_common(6),
            "hearts": heart_count,
        },
        "words_top": word_freq.most_common(40),
        "romantic": {
            "te_amo": te_amo,
            "amor": amor,
            "saudade": saudade,
            "love": love,
            "bom_dia": bomdia,
            "boa_noite": boanoite,
        },
        "laughs": laughs,
        "madrugada": madrugada,
        "media": {
            "by_type": dict(media_by_type),
            "total": sum(media_by_type.values()),
            "markos": dict(media_by_person["markos"]),
            "iris": dict(media_by_person["iris"]),
        },
        "longest_message": {
            "sender": longest_msg["sender"],
            "chars": len(longest_msg["text"]),
            "text": longest_msg["text"][:600],
            "dt": longest_msg["dt"].isoformat(),
        } if longest_msg else None,
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # também embute em data.js para a página funcionar offline (file://)
    with open("data.js", "w", encoding="utf-8") as f:
        f.write("window.WRAPPED = ")
        json.dump(data, f, ensure_ascii=False)
        f.write(";\n")

    # resumo no terminal
    print(f"Mensagens reais: {total}")
    print(f"  Markos: {by_person['markos']}  |  Iris: {by_person['iris']}")
    print(f"Palavras: {sum(word_count.values())}")
    print(f"Período: {first_msg['dt'].date()} -> {last_msg['dt'].date()} ({span_days} dias, {len(day_counts)} ativos)")
    print(f"Dia mais intenso: {data['busiest_day']['date']} ({data['busiest_day']['count']} msgs)")
    print(f"Maior sequência: {longest_streak} dias")
    print(f"'te amo': Markos {te_amo['markos']} | Iris {te_amo['iris']}")
    print(f"'amor': Markos {amor['markos']} | Iris {amor['iris']}")
    print(f"Corações: Markos {heart_count['markos']} | Iris {heart_count['iris']}")
    print(f"Top emojis: {emoji_total.most_common(8)}")
    print(f"Áudios: {media_by_type.get('audio',0)} | Fotos: {media_by_type.get('image',0)} | Figurinhas: {media_by_type.get('sticker',0)}")
    print(f"Resposta mediana: Markos {data['response_seconds']['markos_median']}s | Iris {data['response_seconds']['iris_median']}s")
    print(f"Madrugada(0-5h): Markos {madrugada['markos']} | Iris {madrugada['iris']}")
    print(f"data.json escrito ({total} msgs).")


if __name__ == "__main__":
    main()

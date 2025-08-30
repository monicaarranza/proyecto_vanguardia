// usePn532Hybrid.js
import { useEffect, useRef, useState } from "react";

export function usePn532Hybrid(
    onScan,
    { baseUrl = "", pollMs = 400, suppressInitial = true } = {}
) {
    const [uid, setUid] = useState(null);
    const [last, setLast] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    const onScanRef = useRef(onScan);
    useEffect(() => { onScanRef.current = onScan; }, [onScan]);

    const armedRef = useRef(!suppressInitial);

    // 1) historial por lector (dedupe por lector)
    const lastByReaderRef = useRef({});
    // 2) último par (uid, reader) visto (para permitir MISMO uid si cambia de lector)
    const lastPairRef = useRef({ uid: null, reader: null });

    const url = (p) => baseUrl ? `${baseUrl}${p}` : p;

    const normalize = (data, source = "unknown") => {
        // Asegúrate que el Arduino mande { reader: "in_reader" | "out_reader", uid: "..." }
        // Si no viene, caerá al 'source' (mejor que venga en payload).
        if (typeof data === "string") return { type: "nfc", reader: source, uid: data };
        const uid = data?.uid ?? null;
        const reader = data?.reader || source; // <<-- usa reader del payload
        const batchType = data?.batch_type_id || null;
        return { type: "nfc", reader, uid, batchType };
    };

    const seenReaderOnceRef = useRef({});   // ignora primer evento por lector
    // al tope del hook
    const pageStartRef = useRef(Date.now());
    const graceMs = 800; // 0.8s de tolerancia, ajusta si querés

    const isStale = (evt) => {
        if (!evt?.server_ts) return false;     // si no viene, no filtramos
        return evt.server_ts < (pageStartRef.current - graceMs);
    };

    const maybeFire = (evt) => {
        const readerKey = evt.reader || "default";

        setUid((prev) => (prev !== evt.uid ? evt.uid : prev));
        setLast(evt);

        if (!armedRef.current) return;

        // 1) Ignorar eventos viejos
        if (isStale(evt)) return;

        // 2) Si es ausencia, solo limpia y sal
        if (evt.present === false || !evt.uid) {
            lastByReaderRef.current[readerKey] = null;
            return;
        }

        // 3) Dedupe por lector + permitir mismo UID si cambia de lector
        const prevForReader = lastByReaderRef.current[readerKey];
        const sameReaderSameUid = prevForReader === evt.uid;

        const lastPair = lastPairRef.current || { uid: null, reader: null };
        const switchingReader = lastPair.uid === evt.uid && lastPair.reader !== readerKey;

        if (sameReaderSameUid && !switchingReader) return;

        onScanRef.current && onScanRef.current(evt);
        lastByReaderRef.current[readerKey] = evt.uid;
        lastPairRef.current = { uid: evt.uid, reader: readerKey };
    };


    // init
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const r = await fetch(url("/uid"), { cache: "no-store" });
                const j = await r.json().catch(() => ({}));
                if (cancelled) return;
                const evt = normalize(j, "poll:init");
                setUid(evt.uid ?? null);
                setLast(evt);
                // No “contamines” un lector real con "poll:init", solo limpia global
                lastPairRef.current = { uid: evt.uid ?? null, reader: evt.reader || "poll:init" };
            } catch { } finally {
                armedRef.current = true;
            }
        })();
        return () => { cancelled = true; };
    }, [baseUrl, suppressInitial]);

    // SSE
    useEffect(() => {
        const es = new EventSource(url("/sse"));
        es.onopen = () => { setConnected(true); setError(null); };
        es.onerror = () => { setConnected(false); };

        const handle = (ev) => {
            try {
                const data = JSON.parse(ev.data);
                const evt = normalize(data, "sse");
                maybeFire(evt);
            } catch { }
        };

        es.addEventListener("nfc", handle);
        es.addEventListener("pn532_uid", handle);
        es.addEventListener("pn532_presence", handle);
        return () => es.close();
    }, [baseUrl]);

    // Poll fallback
    // Poll fallback
    // efecto de poll
    useEffect(() => {
        let alive = true, t;
        const tick = async () => {
            try {
                if (connected) return;            // ← clave
                const r = await fetch(url("/uid"), { cache: "no-store" });
                const j = await r.json().catch(() => ({}));
                const evt = normalize(j, "poll");
                maybeFire(evt);
            } catch { }
            if (alive) t = setTimeout(tick, pollMs);
        };
        tick();
        return () => { alive = false; if (t) clearTimeout(t); };
    }, [baseUrl, pollMs, connected]);


    return { uid, last, connected, error };
}

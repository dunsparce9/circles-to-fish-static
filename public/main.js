// Converts osu! beatmaps to Sinker Sound fish. Now with MP3->OGG conversion.
(function () {
    // --- CONSTANTS ---
    const OSU_CANVAS_WIDTH = 512;
    const OSU_CANVAS_HEIGHT = 384;
    const OSU_ASPECT_RATIO = OSU_CANVAS_WIDTH / OSU_CANVAS_HEIGHT;
    // --- DOM ELEMENTS ---
    const dropZone = document.getElementById('drop-zone');
    const oszInput = document.getElementById('osz-input');
    const beatmapDetailsDiv = document.getElementById('beatmap-details');
    const difficultySelect = document.getElementById('difficulty-select');
    const bpmInput = document.getElementById('bpm-input');
    const fishNameInput = document.getElementById('fish-name-input');
    const convertBtn = document.getElementById('convert-btn');
    const statusDiv = document.getElementById('status');
    const logDiv = document.getElementById('logarea');
    const fishModelSelect = document.getElementById('fish-model-select');
    const fishViewer = document.getElementById('fish-viewer');
    // --- APP STATE ---
    let loadedOsz = null;
    let parsedBeatmaps = [];
    let audioFile = { name: null, data: null };
    // --- HELPER FUNCTIONS ---
    function updateStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.style.color = 'var(--text-color)';
        if (type === 'error') statusDiv.style.color = 'var(--error-color)';
        if (type === 'success') statusDiv.style.color = 'var(--success-color)';
        logDiv.textContent += message + "\n";
    }
    function resetUI() {
        beatmapDetailsDiv.classList.add('hidden');
        difficultySelect.innerHTML = '';
        bpmInput.value = '';
        fishNameInput.value = '';
        convertBtn.disabled = true;
        loadedOsz = null;
        parsedBeatmaps = [];
        audioFile = { name: null, data: null };
        fishModelSelect.selectedIndex = 0;
    }

    // --- MODIFIED parseOsuFile FUNCTION ---
    function parseOsuFile(content, fileName) {
        const lines = content.split(/\r?\n/);
        const beatmap = {
            fileName: fileName,
            audioFilename: '',
            audioLeadIn: 0,
            timingOffset: 0, // <-- ADDED
            title: '',
            artist: '',
            version: '',
            timingPoints: [],
            hitObjects: []
        };
        let currentSection = '';
        let isFirstTimingPoint = true; // <-- ADDED

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('//') || trimmedLine === '') continue;
            if (trimmedLine.startsWith('[')) {
                currentSection = trimmedLine;
                continue;
            }
            switch (currentSection) {
                case '[General]':
                    if (trimmedLine.startsWith('AudioFilename:')) beatmap.audioFilename = trimmedLine.substring(14).trim();
                    if (trimmedLine.startsWith('AudioLeadIn:')) beatmap.audioLeadIn = parseInt(trimmedLine.substring(12).trim(), 10) || 0;
                    break;
                case '[Metadata]':
                    if (trimmedLine.startsWith('Title:')) beatmap.title = trimmedLine.substring(6).trim();
                    if (trimmedLine.startsWith('Artist:')) beatmap.artist = trimmedLine.substring(7).trim();
                    if (trimmedLine.startsWith('Version:')) beatmap.version = trimmedLine.substring(8).trim();
                    break;
                case '[TimingPoints]':
                    const tpParts = trimmedLine.split(',');
                    // Capture the offset from the very first timing line.
                    if (isFirstTimingPoint && tpParts.length > 0) {
                        beatmap.timingOffset = parseInt(tpParts[0], 10) || 0;
                        isFirstTimingPoint = false;
                    }

                    if (tpParts.length >= 2 && parseFloat(tpParts[1]) > 0) {
                        beatmap.timingPoints.push({
                            time: parseInt(tpParts[0], 10),
                            beatLength: parseFloat(tpParts[1]),
                            bpm: 60000 / parseFloat(tpParts[1])
                        });
                    }
                    break;
                case '[HitObjects]':
                    const hoParts = trimmedLine.split(',');
                    if (hoParts.length >= 3) {
                        beatmap.hitObjects.push({
                            x: parseInt(hoParts[0], 10),
                            y: parseInt(hoParts[1], 10),
                            time: parseInt(hoParts[2], 10)
                        });
                    }
                    break;
            }
        }
        return beatmap;
    }

    function updateUIForSelection() {
        const selectedIndex = difficultySelect.selectedIndex;
        if (selectedIndex < 0 || parsedBeatmaps.length === 0) return;
        const selectedBeatmap = parsedBeatmaps[selectedIndex];
        const firstTimingPoint = selectedBeatmap.timingPoints[0];
        if (firstTimingPoint) {
            bpmInput.value = firstTimingPoint.bpm.toFixed(2);
        } else {
            bpmInput.value = 120; // Default fallback
            updateStatus('Warning: Could not find a primary timing point. Using 120 BPM.', 'error');
        }
        if (!fishNameInput.value) { // Only set if empty
            fishNameInput.value = selectedBeatmap.title;
        }
        convertBtn.disabled = false;
    }
    // --- CORE CONVERSION LOGIC ---
    function computeAngle(x, y) {
        const dx = x - OSU_CANVAS_WIDTH / 2;
        const dy = (y - OSU_CANVAS_HEIGHT / 2) * OSU_ASPECT_RATIO;
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        return angle;
    }
    function computePos(ms, bpm) {
        return (ms * bpm / 60000);
    }

    // --- MODIFIED convertAndDownload FUNCTION ---
    async function convertAndDownload() {
        updateStatus('Starting conversion...');
        convertBtn.disabled = true;
        let ffmpeg = null;
        try {
            const selectedIndex = difficultySelect.selectedIndex;
            const beatmap = parsedBeatmaps[selectedIndex];
            const fishName = fishNameInput.value.trim() || 'Untitled Fish';
            const bpm = parseFloat(bpmInput.value);
            const tensionMultiplier = parseFloat(document.getElementById('tension-multiplier-select').value);

            if (!beatmap || isNaN(bpm)) {
                throw new Error("Invalid beatmap data or BPM.");
            }

            // Combine audioLeadIn with the parsed timing offset for a total offset.
            const totalOffset = beatmap.audioLeadIn + beatmap.timingOffset;
            const offsetInSeconds = beatmap.timingOffset / 1000;

            updateStatus('Generating Sinker Sound events...');
            const events = [];
            let maxPos = 0;
            events.push({ "angle": -45.0, "bpm": bpm, "event_type": ["AfterTimeEvent"], "methodName": "bpm_change", "pos": 0.0, "type": "CallCustomMethod" });
            events.push({ "angle": 22.5, "instant_end": true, "loops": 0.7, "methodName": "progress_phase", "pos": 0.0, "type": "CallCustomMethod", "y": 2.0 });
            events.push({ "angle": 0.0, "event_type": ["AfterTimeEvent"], "methodName": "pitch_set", "pitch_set_array": "B-1,A-1,B-1,A-1,A-1", "pitch_set_int": 1.0, "pos": 0.5, "type": "CallCustomMethod", "y": 2.0 });
            events.push({
                "angle": -45.0,
                "event_type": ["AfterTimeEvent"],
                "methodName": "tension_natural_loss_multiplier",
                "pos": 1.0,
                "type": "CallCustomMethod",
                "value": tensionMultiplier
            });

            for (const ho of beatmap.hitObjects) {
                // The 'totalOffset' modification handles the position adjustment automatically.
                const effectiveTime = ho.time - totalOffset;
                if (effectiveTime < 0) continue;
                const angle = parseFloat(computeAngle(ho.x, ho.y).toFixed(2));
                const pos = parseFloat(computePos(effectiveTime, bpm).toFixed(2));
                if (pos > maxPos) { maxPos = pos; }
                events.push({ "angle": angle, "methodName": "pull_beat", "pos": pos, "type": "CallCustomMethod", "y": 2.0 });
            }

            let audioFileData;
            let outputAudioFilename = fishName + '.ogg';
            const needsConversion = audioFile.name.toLowerCase().endsWith('.mp3');

            if (needsConversion) {
                updateStatus('Initializing audio converter...');
                ffmpeg = FFmpeg.createFFmpeg({ log: true });
                updateStatus('Audio is MP3, converting to OGG. This may take a moment...');
                await ffmpeg.load();
                const inputAudioData = await loadedOsz.file(audioFile.name).async('uint8array');
                ffmpeg.FS('writeFile', audioFile.name, inputAudioData);

                // Build the FFmpeg command array, adding the -ss trim argument if needed.
                const ffmpegArgs = [];
                if (offsetInSeconds > 0) {
                    updateStatus(`Audio has a ${offsetInSeconds.toFixed(3)}s offset, trimming...`);
                    ffmpegArgs.push('-ss', offsetInSeconds.toString());
                }
                ffmpegArgs.push('-i', audioFile.name, '-c:a', 'libvorbis', '-q:a', '8', outputAudioFilename);
                await ffmpeg.run(...ffmpegArgs);

                const data = ffmpeg.FS('readFile', outputAudioFilename);
                audioFileData = new Blob([data.buffer], { type: 'audio/ogg' });
                updateStatus('Audio conversion successful!');
            } else {
                // Note: This logic assumes non-mp3 files don't need trimming.
                // If .ogg or .wav files also need trimming, this part would need FFmpeg as well.
                updateStatus('Audio is already compatible. Packaging file...');
                audioFileData = await loadedOsz.file(audioFile.name).async('blob');
                if (offsetInSeconds > 0) {
                    updateStatus('Warning: Non-MP3 audio has an offset but trimming is only implemented for MP3 conversion.', 'error');
                }
            }

            updateStatus('Measuring audio duration…');
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioCtx.decodeAudioData(await audioFileData.arrayBuffer());
            const durationMs = audioBuffer.duration * 1000;
            // The total offset no longer needs to be subtracted here because the audio is already trimmed.
            const usableMs = Math.max(0, durationMs);
            const trueEndPos = computePos(usableMs, bpm);

            const endPos = Math.max(maxPos, trueEndPos);
            events.sort((a, b) => a.pos - b.pos);
            events.push({ "angle": 0.0, "methodName": "loop_end", "pos": parseFloat((endPos - 1.0).toFixed(2)), "type": "CallCustomMethod", "y": 2.0 });
            events.push({ "angle": 0.0, "event_type": ["AfterTimeEvent"], "methodName": "progress_end", "pos": parseFloat(endPos.toFixed(2)), "type": "CallCustomMethod", "y": 2.0 });
            const fishchartJson = { "events": events, "song_info": { "bpm": bpm } };
            updateStatus('Packaging .zip file...');
            const outputZip = new JSZip();
            outputZip.file(`${fishName}.fishchart`, JSON.stringify(fishchartJson, null, 2));
            outputZip.file(outputAudioFilename, audioFileData);
            const selectedTres = fishModelSelect.value;
            if (selectedTres) {
                updateStatus(`Including model file: ${selectedTres}…`);
                const res = await fetch(`/tres/${selectedTres}`);
                if (!res.ok) throw new Error(`Failed to load model file "${selectedTres}"`);
                let tresText = await res.text();
                const songName = beatmap.title;
                tresText = tresText
                    .replace(/song_name\s*=\s*".*?"/, `song_name = "${songName}"`)
                    .replace(/bpm\s*=\s*\d+/, `bpm = ${bpm}`);
                const patchedBlob = new Blob([tresText], { type: 'text/plain;charset=utf-8' });
                outputZip.file(selectedTres, patchedBlob);
            }
            updateStatus('Generating download...');
            const zipBlob = await outputZip.generateAsync({ type: 'blob' });
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(zipBlob);
            downloadLink.download = fishName + '.zip';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadLink.href);
            updateStatus('Successfully created ' + fishName + '.zip!', 'success');
        } catch (error) {
            console.error(error);
            updateStatus(`Conversion Failed: ${error.message}`, 'error');
        } finally {
            if (ffmpeg && ffmpeg.isLoaded()) {
                ffmpeg.exit();
            }
            convertBtn.disabled = false;
        }
    }

    // --- EVENT HANDLERS ---
    async function handleFile(file) {
        if (!file) return;
        resetUI();
        updateStatus('Reading .osz file...');
        try {
            loadedOsz = await JSZip.loadAsync(file);
            const osuFiles = [];
            loadedOsz.forEach((relativePath, zipEntry) => {
                if (zipEntry.name.toLowerCase().endsWith('.osu')) {
                    osuFiles.push(zipEntry);
                }
            });
            if (osuFiles.length === 0) { throw new Error('No .osu files found in the archive.'); }
            updateStatus(`Found ${osuFiles.length} difficulties. Parsing...`);
            for (const osuFile of osuFiles) {
                const content = await osuFile.async('text');
                const parsed = parseOsuFile(content, osuFile.name);
                if (parsed.hitObjects.length > 0) { parsedBeatmaps.push(parsed); }
            }
            if (parsedBeatmaps.length === 0) { throw new Error('Found .osu files, but none could be parsed or they were empty.'); }
            parsedBeatmaps.sort((a, b) => a.fileName.localeCompare(b.fileName));
            parsedBeatmaps.forEach((bm, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = bm.version || bm.fileName;
                difficultySelect.appendChild(option);
            });
            const primaryBeatmap = parsedBeatmaps[0];
            audioFile.name = primaryBeatmap.audioFilename;
            if (!loadedOsz.file(audioFile.name)) {
                throw new Error(`Audio file "${audioFile.name}" not found in the archive.`);
            }
            updateStatus('Beatmap loaded successfully. Please select a difficulty.', 'success');
            beatmapDetailsDiv.classList.remove('hidden');
            updateUIForSelection();
        } catch (error) {
            console.error(error);
            updateStatus(`Error: ${error.message}`, 'error');
            resetUI();
        }
    }
    oszInput.addEventListener('change', (e) => { if (e.target.files.length > 0) { handleFile(e.target.files[0]); } });
    difficultySelect.addEventListener('change', updateUIForSelection);
    convertBtn.addEventListener('click', convertAndDownload);
    fishModelSelect.addEventListener('change', (e) => {
        const selectedFish = e.target.value;
        // This relies on a 'fishModels' object which is not defined in the original script.
        // The functionality to show the model will not work without it, but the conversion will.
        // To make it work, you would need something like:
        // const fishModels = { 'angelic_fish.tres': '/path/to/angelic_fish.glb' };
        const modelSrc = null; // = fishModels[selectedFish]; 
        if (modelSrc) {
            fishViewer.src = modelSrc;
            modelContainer.classList.remove('hidden');
        } else {
            modelContainer.classList.add('hidden');
            fishViewer.removeAttribute('src');
        }
    });
})();
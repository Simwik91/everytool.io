const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

async function convertVideo() {
    const videoInput = document.getElementById('videoInput');
    const outputFormat = document.getElementById('outputFormat').value;
    const status = document.getElementById('status');
    const outputVideo = document.getElementById('outputVideo');

    if (!videoInput.files[0]) {
        status.textContent = 'Please select a video file.';
        return;
    }

    status.textContent = 'Loading FFmpeg...';
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    status.textContent = 'Converting...';
    const inputFile = videoInput.files[0];
    ffmpeg.FS('writeFile', 'input', await fetchFile(inputFile));

    const outputFile = `output.${outputFormat}`;
    await ffmpeg.run('-i', 'input', outputFile);

    const data = ffmpeg.FS('readFile', outputFile);
    const url = URL.createObjectURL(new Blob([data.buffer], { type: `video/${outputFormat}` }));
    outputVideo.src = url;

    status.textContent = 'Conversion complete!';
    ffmpeg.FS('unlink', 'input');
    ffmpeg.FS('unlink', outputFile);
}

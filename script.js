// Select elements
let musicPlayer = document.querySelector(".music-player-container");
let togglePlayer = document.querySelector(".toggle-player");

let trackName = document.querySelector(".track-name");
let trackDurationDisplay = document.querySelector(".track-duration");

let playPauseBtn = document.querySelector(".playpause-track");
let nextBtn = document.querySelector(".next-track");
let prevBtn = document.querySelector(".prev-track");

let songUpload = document.getElementById("song-upload");
let volumeSlider = document.getElementById("volume-slider");
let listedSongsContainer = document.querySelector(".listed-songs");
let listedButton = document.querySelector(".buttons button:nth-child(1)");
let shuffledButton = document.querySelector(".buttons button:nth-child(2)");
let clearButton = document.querySelector(".buttons button:nth-child(3)");
let totalDurationDisplay = document.querySelector(".total-duration");
let soundBars = document.querySelector(".sound-bars");

let leftSide = document.querySelector(".left-side");
let toggleLeft = document.querySelector(".toggle-left");

let trackIndex = 0;
let isPlaying = false;
let trackList = [];
let currentTrack = document.createElement("audio");
let totalDuration = 0; // Store total duration in seconds

// Initially disable buttons
function updateButtonStates() {
  const isTrackListEmpty = trackList.length === 0;
  const isTrackPlaying = isPlaying;

  // Disable buttons before music is loaded and when music is playing
  listedButton.disabled = isTrackListEmpty || isTrackPlaying;
  shuffledButton.disabled = isTrackListEmpty || isTrackPlaying;
  clearButton.disabled = isTrackListEmpty || isTrackPlaying;
}

// Call this function on page load
updateButtonStates();

// Toggle the left side menu
toggleLeft.addEventListener("click", function () {
  leftSide.classList.toggle("closed"); // Add or remove 'closed' class

  // Update the icon based on the state
  toggleLeft.innerHTML = leftSide.classList.contains("closed")
    ? '<ion-icon name="add-outline"></ion-icon>'
    : '<ion-icon name="remove-outline"></ion-icon>';
});

// Toggle the player visibility
togglePlayer.addEventListener("click", function () {
  const isHidden = musicPlayer.classList.toggle("hide"); // Add or remove 'hide' class

  // Update the icon based on the state
  togglePlayer.innerHTML = isHidden
    ? '<ion-icon name="add-outline"></ion-icon>'
    : '<ion-icon name="remove-outline"></ion-icon>';
});

// Handle file upload and enable buttons when songs are added
songUpload.addEventListener("change", function () {
  // Map uploaded files into trackList
  trackList = Array.from(songUpload.files).map((file) => ({
    name: file.name.replace(".mp3", ""), // Remove .mp3 extension
    path: URL.createObjectURL(file),
  }));

  totalDuration = 0; // Reset total duration
  updateButtonStates(); // Enable buttons since songs are uploaded
  displaySongs(trackList); // Display the uploaded songs in the UI
  loadTracksWithDuration(); // Load track durations
});

// Function to display songs in the listed-songs container
function displaySongs(songs) {
  listedSongsContainer.innerHTML = ""; // Clear previous list
  songs.forEach((song, index) => {
    const songItem = document.createElement("p");
    const duration = song.duration ? ` (${formatTime(song.duration)})` : ""; // Add duration if available
    songItem.textContent = `${index + 1}. ${song.name}${duration}`;
    listedSongsContainer.appendChild(songItem);
  });
}

// Load track by index
function loadTrack(index) {
  currentTrack.src = trackList[index].path;
  currentTrack.load();
  trackName.textContent = trackList[index].name;
  currentTrack.onloadedmetadata = function () {
    trackList[index].duration = currentTrack.duration;
    trackDurationDisplay.textContent = `0:00 / ${formatTime(currentTrack.duration)}`;
  };

  currentTrack.ontimeupdate = function () {
    const currentTime = formatTime(currentTrack.currentTime);
    const duration = formatTime(currentTrack.duration);
    trackDurationDisplay.textContent = `${currentTime} / ${duration}`;
  };

  currentTrack.onended = function () {
    nextTrack(); // Automatically play the next track when the current one ends
  };
}

// Load all tracks and retrieve their durations
function loadTracksWithDuration() {
  totalDuration = 0; // Reset total duration before calculating
  let loadedCount = 0; // Track how many tracks have loaded their metadata

  trackList.forEach((track, index) => {
    const audio = new Audio(track.path);
    audio.onloadedmetadata = () => {
      track.duration = audio.duration; // Store duration in seconds
      totalDuration += audio.duration; // Add to total duration
      loadedCount++;

      // Update total duration once all tracks have loaded
      if (loadedCount === trackList.length) {
        updateTotalDuration();
        displaySongs(trackList); // Update displayed song list with durations
        loadTrack(trackIndex); // Start the first track automatically if desired
        updateButtonStates(); // Ensure buttons are enabled when loading finishes
      }
    };
  });
}

// Update total duration of the playlist
function updateTotalDuration() {
  totalDurationDisplay.textContent = `Total Duration: ${formatTime(totalDuration)}`;
}

// Play or pause track
function playPauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  if (trackList.length > 0) {
    currentTrack.play();
    isPlaying = true;
    playPauseBtn.innerHTML = '<ion-icon name="pause-sharp"></ion-icon>';
    soundBars.classList.add("animate"); // Start sound bars animation
    updateButtonStates(); // Disable buttons while playing
  }
}

function pauseTrack() {
  currentTrack.pause();
  isPlaying = false;
  playPauseBtn.innerHTML = '<ion-icon name="play-sharp"></ion-icon>';
  soundBars.classList.remove("animate"); // Stop sound bars animation
  updateButtonStates(); // Enable buttons when paused
}

// Go to the next track
function nextTrack() {
  trackIndex = (trackIndex + 1) % trackList.length;
  loadTrack(trackIndex);
  playTrack();
}

// Go to the previous track
function prevTrack() {
  trackIndex = trackIndex > 0 ? trackIndex - 1 : trackList.length - 1;
  loadTrack(trackIndex);
  playTrack();
}

// Shuffle an array randomly
function shuffleArray(array) {
  return array
    .map((item) => ({ sort: Math.random(), value: item }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.value);
}

// Volume control: Adjust current track volume
volumeSlider.addEventListener("input", function () {
  currentTrack.volume = volumeSlider.value; // Set the audio volume to slider value
});

// Sort songs in alphabetical order (Listed)
listedButton.addEventListener("click", () => {
  trackList.sort((a, b) => a.name.localeCompare(b.name));
  displaySongs(trackList);
  loadTrack(trackIndex);
});

// Shuffle songs randomly (Shuffled)
shuffledButton.addEventListener("click", () => {
  trackList = shuffleArray(trackList);
  displaySongs(trackList);
  loadTrack(trackIndex);
});

// Clear songs (Clear)
clearButton.addEventListener("click", () => {
  location.reload(); // Reload the page to reset the app completely
});

// Format time in minutes and seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

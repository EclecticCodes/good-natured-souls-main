const VideoBackground = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/images/GoodLuckVid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10">
        {/* Any content you want to overlay on top of the video goes here */}
      </div>
    </div>
  );
};

export default VideoBackground;

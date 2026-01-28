import { Search } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectCoverflow } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

export default function Home() {
  // Using more images for better loop experience
  const baseImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTdKXCM1YMg14hIsVmmu5JOlCKLr8VT3Cvaw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFxMp-ae9i-QACpB8Wxbi5t8SpPgCgAElk7w&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRONrHuLZe6fuqnBwVmVeHu8cR3bup6nXqXsg&s",
  ];

  // Triple the images for seamless looping
  const images = [...baseImages, ...baseImages, ...baseImages];

  return (
    <div className="w-full text-gray-800">
      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image with Gradient Fade */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://hips.hearstapps.com/hmg-prod/images/alpe-di-siusi-sunrise-with-sassolungo-or-langkofel-royalty-free-image-1623254127.jpg)'
            }}
          />
          {/* Gradient Overlay - Fades from transparent at top to white at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white" />
        </div>

        {/* INTRO - Transparent Box */}
        <div className="relative z-10 mx-auto mt-32 max-w-4xl p-10 text-center">
          <h1 className="text-5xl font-bold text-black drop-shadow-2xl">
            Your Travel Companion, Everywhere 
          </h1>
          <p className="mt-4 text-xl text-white drop-shadow-lg">
            Find like-minded travelers, plan trips, and explore together.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative z-10 mt-10 flex justify-center">
          <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-lg">
            <Search className="text-gray-400" />
            <input
              className="w-full outline-none"
              placeholder="Search destination, people, or trips"
            />
            <button className="rounded-xl bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 transition">
              Go
            </button>
          </div>
        </div>

        {/* FIXED INFINITE LOOP CAROUSEL */}
        <div className="relative z-10 mx-auto mt-20 max-w-7xl px-6 pb-20">
          <Swiper
            modules={[Navigation, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false,
            }}
            loop={true}
            loopAdditionalSlides={3}
            loopedSlides={images.length}
            navigation={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={600}
            watchSlidesProgress={true}
            className="travel-swiper"
          >
            {images.map((img, i) => (
              <SwiperSlide key={`slide-${i}`}>
                <div className="carousel-card">
                  <img src={img} alt={`travel destination ${(i % baseImages.length) + 1}`} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-8 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-sky-700">
          Why Travel Sathi?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            ["Smart Matching", "Find travelers that match your style"],
            ["Trip Planning", "Plan trips together effortlessly"],
            ["Safe & Verified", "Community driven & secure"],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-3xl bg-white p-8 text-center shadow-lg"
            >
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
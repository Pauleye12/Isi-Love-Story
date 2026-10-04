import React from "react";

const EventContact = () => {
  return (
    <section
      className="relative py-14 sm:py-16 px-6 max-w-170 mx-auto"
      id="rsvp"
    >
      <p className="font-serif-romantic text-4xl sm:text-5xl text-[#FFE5B4] mb-16 text-center">
        Event Contact
      </p>
      {/* Decorative Tree & Floral Accents */}

      <div className=" relative flex flex-col items-center justify-center bg-stone-900/30 rounded-xl p-5 border border-stone-800   ">
        <p className="font-editorial text-lg sm:text-xl leading-relaxed text-center text-[#FFE5B4] max-w-130 mx-auto mb-9 ">
          For enquiries, please feel free to reach out to:
        </p>
        <p className="text-stone-300">
          {" "}
          <strong>Chinyem:</strong> +234 701 955 1876
        </p>
        <p className="text-stone-300">
          <strong>Ijeoma:</strong> +234 803 205 4265
        </p>
      </div>

      {/* RSVP Contact */}
    </section>
  );
};

export default EventContact;

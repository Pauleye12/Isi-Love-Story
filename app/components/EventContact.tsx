import React from "react";

const EventContact = () => {
  return (
    <section
      className="relative min-h-[20dvh] flex flex-col w-full items-center justify-center py-1 sm:py-16 px-6 max-w-170 mx-auto"
      id="rsvp"
    >
      <p className="font-serif-romantic text-4xl sm:text-5xl text-[#FFE5B4] mb-10 text-center">
        Event Contact
      </p>
      {/* Decorative Tree & Floral Accents */}

      <div className=" relative flex flex-col items-center justify-center bg-stone-900/30 rounded-xl p-5 border border-stone-800 w-full  ">
        <p className="font-editorial text-lg sm:text-xl leading-relaxed text-center text-[#FFE5B4] max-w-130 mx-auto mb-9 ">
          For enquiries, please reach out to:
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

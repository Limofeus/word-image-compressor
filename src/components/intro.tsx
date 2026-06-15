// src/components/intro.tsx
const Intro = () => {
  return (
    <section className="animate-fadeIn animate-delay-100">
      <div className="container mx-auto py-8 2xl:max-w-[1400px]">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-x-2 rounded-full border p-1 ps-3 text-sm transition">
            <span className="text-base">🎓</span>
            Дипломосжиматель 3000
            <span className="bg-muted-foreground/15 inline-flex items-center justify-center gap-x-2 rounded-full px-2.5 py-1.5 text-sm font-medium">
              <svg
                className="h-4 w-4 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </span>
        </div>
        <div className="mx-auto mt-4 max-w-2xl text-center">
          <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
            ВОРДКОМПРЕСОР3000 — Дипломосжиматель
          </h1>
        </div>
        <div className="mx-auto mt-4 max-w-3xl text-center">
          <p className="text-muted-foreground text-lg !leading-6">
            Загрузите DOCX, вытащите картинки, отредактируйте шакальность и соберите обратно. Потому что у ВУЗа нет денег на флешку блин.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Intro;

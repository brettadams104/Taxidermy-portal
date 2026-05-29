export default function AboutPage() {
  return (
    <div className="space-y-8 pb-8">

      {/* Hero */}
      <div className="bg-black rounded-2xl px-6 py-8 text-white">
        <p className="text-sm uppercase tracking-widest text-gray-400 mb-1">B Cuts Taxidermy</p>
        <h1 className="text-3xl font-bold leading-tight">Passion-Driven.<br />Quality Crafted.</h1>
        <p className="text-gray-400 mt-2 text-sm">Lake Geneva, Wisconsin</p>
      </div>

      {/* About Brett */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold border-l-4 border-black pl-3">About Brett</h2>
        <p className="text-gray-700 leading-relaxed">
          Originally from Pittsburgh, PA, Brett made the move to Lake Geneva, Wisconsin in 2014 — and never looked back. Nestled in the heart of the Midwest, Lake Geneva gave him the perfect home base for the outdoor lifestyle he had always lived.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Brett's love for the outdoors runs deep. He shot his first buck at just 9 years old, and by 12 he had taken his first buck solo with a compound bow — a milestone that set the tone for the hunter he would become.
        </p>
      </div>

      {/* The Hunter */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold border-l-4 border-black pl-3">The Hunter</h2>
        <p className="text-gray-700 leading-relaxed">
          Archery hunting has been a way of life for Brett for as long as he can remember. Each fall he heads out West to chase elk with a bow — one of the most physically demanding and rewarding hunts in North America. But when all is said and done, his true passion lies in Midwest whitetail. There's nothing quite like the challenge of hunting mature bucks in the hardwoods of Wisconsin.
        </p>
      </div>

      {/* Euro Mount Background */}
      <div className="bg-gray-50 border rounded-2xl px-5 py-6 space-y-3">
        <h2 className="text-xl font-bold">Where It All Started</h2>
        <p className="text-gray-700 leading-relaxed">
          Brett completed his first European mount at 11 years old and has been doing them for family and friends every year since. What started as a personal tradition turned into a craft — and eventually, a business. Over the years he has processed hundreds of skulls, continuously refining his technique into an efficient system that delivers a quality finished product in a short amount of time, at a price that won't break the bank.
        </p>
      </div>

      {/* The Process */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold border-l-4 border-black pl-3">The Process</h2>
        <p className="text-gray-700 leading-relaxed">
          Every skull that comes through B Cuts goes through a proven, multi-step process built on attention to detail and respect for the animal.
        </p>

        <div className="space-y-3">
          {[
            {
              step: '01',
              title: 'Skull Prep',
              body: 'The skull is completely skinned. All vertebra, eyes, jaw, tongue, and as much meat as possible are removed before anything else begins.',
            },
            {
              step: '02',
              title: 'Maceration',
              body: 'The skull soaks in a maceration tank for approximately one week. This natural process jump-starts degreasing, breaks down remaining tissue, and sets up a much smoother cleaning stage.',
            },
            {
              step: '03',
              title: 'Cleaning',
              body: 'The skull is slow-cooked until any remaining meat releases effortlessly. No shortcuts — this step is done right so the finished product is clean and odor-free.',
            },
            {
              step: '04',
              title: 'Degreasing & Whitening',
              body: 'Finally, the skull is degreased to remove natural oils and then whitened to a bright, uniform finish. The result is a display-ready European mount you can be proud of.',
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex gap-4 border rounded-xl p-4 bg-white shadow-sm">
              <span className="text-2xl font-black text-gray-200 leading-none shrink-0">{step}</span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why B Cuts */}
      <div className="bg-black rounded-2xl px-6 py-6 text-white space-y-3">
        <h2 className="text-xl font-bold">Why B Cuts?</h2>
        <div className="space-y-2">
          {[
            { label: 'Quality', detail: 'Every skull is treated with the same care and attention whether it\'s your first or your fifteenth.' },
            { label: 'Fast Turnaround', detail: 'An efficient process means you\'re not waiting months to get your mount back.' },
            { label: 'Affordable Price', detail: 'Trophy-quality work at a price that makes sense for everyday hunters.' },
          ].map(({ label, detail }) => (
            <div key={label} className="flex gap-3 items-start">
              <span className="mt-1 w-2 h-2 rounded-full bg-white shrink-0" />
              <p className="text-sm text-gray-300"><span className="text-white font-semibold">{label} — </span>{detail}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

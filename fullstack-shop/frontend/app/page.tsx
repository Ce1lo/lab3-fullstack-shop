import Link from 'next/link';
import { Icon } from '@/components/Icons';

const notes = [
  ['01', 'Ít nhưng tốt', 'Chọn món dùng được lâu, không chạy theo số lượng.'],
  ['02', 'Giao diện rõ ràng', 'Mọi thứ cần thiết nằm đúng nơi bạn mong đợi.'],
  ['03', 'Đặt hàng gọn', 'Giỏ hàng và trạng thái đơn luôn được cập nhật tức thì.'],
];

export default function Home() {
  return (
    <main className="grain overflow-hidden">
      <section className="relative mx-auto grid min-h-[630px] max-w-6xl items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pb-28 lg:pt-24">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-dark)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            essentials / 2026
          </p>
          <h1 className="max-w-[720px] text-[clamp(3.5rem,9vw,7.7rem)] font-semibold leading-[0.88] tracking-[-0.085em] text-[var(--foreground)]">
            Những món đồ <em className="font-serif font-normal tracking-[-0.07em] text-[var(--accent)]">ở lại.</em>
          </h1>
          <p className="mt-8 max-w-[430px] text-base leading-7 text-[var(--muted)] sm:text-lg">
            Một tuyển chọn nhỏ cho nhịp sống hàng ngày. Đơn giản, có chất liệu, và đủ dùng.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 rounded-full bg-[var(--foreground)] px-6 py-3.5 text-sm font-semibold text-[#f8f0e4] transition-all hover:bg-[var(--accent)] active:scale-[.98]"
            >
              Xem bộ sưu tập
              <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#story" className="text-sm font-semibold text-[var(--muted)] underline decoration-[#cfc3b4] underline-offset-4 hover:text-[var(--foreground)]">
              Vì sao folio?
            </a>
          </div>
        </div>

        <div className="relative mx-auto h-[390px] w-full max-w-[450px] lg:h-[510px]">
          <div className="absolute inset-x-8 top-8 h-[330px] rotate-[-7deg] rounded-[42px] bg-[#d9e0d4] lg:inset-x-12 lg:h-[425px]" />
          <div className="absolute inset-x-3 bottom-0 top-0 rotate-[6deg] rounded-[42px] bg-[#e8a58d] shadow-[0_30px_80px_rgba(91,57,39,.18)] lg:inset-x-5" />
          <div className="absolute inset-5 bottom-7 flex flex-col justify-between rounded-[35px] bg-[#f6d9c7] p-7 text-[#5e392e] lg:inset-8 lg:p-10">
            <div className="flex items-start justify-between">
              <span className="rounded-full border border-[#aa6d5b]/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">F / 01</span>
              <span className="text-right text-[10px] uppercase tracking-[0.16em]">made for<br />everyday</span>
            </div>
            <div>
              <div className="mb-8 h-24 w-24 rounded-[28px] border border-[#9e604e]/25 bg-[#edbca4] shadow-inner lg:h-32 lg:w-32" />
              <p className="font-serif text-5xl italic leading-[.86] tracking-[-0.07em] lg:text-7xl">soft<br />utility.</p>
            </div>
            <div className="flex items-end justify-between border-t border-[#aa6d5b]/30 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em]">
              <span>quiet objects</span><span>since 2026</span>
            </div>
          </div>
        </div>
      </section>

      <section id="story" className="border-y border-[var(--line)] bg-[#ebe5dc]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-dark)]">The folio note</p>
            <h2 className="mt-4 max-w-sm text-4xl font-semibold leading-[.98] tracking-[-0.06em] sm:text-5xl">Mua ít hơn.<br /><span className="font-serif font-normal italic text-[var(--sage)]">Chọn kỹ hơn.</span></h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {notes.map(([number, title, body]) => (
              <article key={number} className="border-t border-[#cfc6b8] pt-4">
                <p className="text-xs font-semibold text-[var(--accent-dark)]">{number}</p>
                <h3 className="mt-8 text-lg font-semibold tracking-[-0.03em]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-7 px-5 py-16 sm:flex-row sm:items-end sm:justify-between lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-dark)]">Start here</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Món mới, nhịp sống mới.</h2>
        </div>
        <Link href="/products" className="group inline-flex items-center gap-3 self-start border-b border-[var(--foreground)] pb-2 text-sm font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)]">
          Đi đến cửa hàng <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>
    </main>
  );
}

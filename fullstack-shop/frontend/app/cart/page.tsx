'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Icon } from '@/components/Icons';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface CartResponse {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
}

type ApiError = AxiosError<{ error?: string }>;

function formatPrice(price: number) {
  return `${price.toLocaleString('vi-VN')} đ`;
}

export default function CartPage() {
  const queryClient = useQueryClient();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  const { data: cart, isLoading, isError, refetch } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: () => api.get('/api/cart').then((response) => response.data),
  });

  const errorMessage = (error: unknown, fallback: string) =>
    (error as ApiError).response?.data?.error || fallback;

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      api.put(`/api/cart/${productId}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (error: unknown) => toast.error(errorMessage(error, 'Không thể cập nhật số lượng')),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) => api.delete(`/api/cart/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xoá khỏi giỏ');
    },
    onError: (error: unknown) => toast.error(errorMessage(error, 'Không thể xoá sản phẩm')),
  });

  const clearMutation = useMutation({
    mutationFn: () => api.delete('/api/cart'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã làm trống giỏ hàng');
    },
    onError: (error: unknown) => toast.error(errorMessage(error, 'Không thể xoá giỏ hàng')),
  });

  const orderMutation = useMutation({
    mutationFn: () => api.post('/api/orders', { customerName, phone }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setCustomerName('');
      setPhone('');
      toast.success(`Đặt hàng thành công · ${response.data.code}`);
    },
    onError: (error: unknown) => toast.error(errorMessage(error, 'Không thể tạo đơn hàng')),
  });

  if (isLoading) {
    return <main className="mx-auto max-w-6xl px-5 pb-20 pt-16 lg:px-8"><div className="h-10 w-64 animate-pulse rounded-lg bg-[#e8e1d7]" /><div className="mt-10 grid gap-5 lg:grid-cols-[1fr_360px]"><div className="h-[400px] animate-pulse rounded-[28px] bg-[#e8e1d7]" /><div className="h-[360px] animate-pulse rounded-[28px] bg-[#e8e1d7]" /></div></main>;
  }

  if (isError) {
    return <main className="mx-auto max-w-6xl px-5 pb-20 pt-16 lg:px-8"><div className="rounded-[28px] bg-[#f6d9d2] px-6 py-12 text-center text-[#8e392d]"><p>Không thể tải giỏ hàng từ backend.</p><button onClick={() => refetch()} className="mt-4 font-semibold underline underline-offset-4">Thử lại</button></div></main>;
  }

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-12 lg:px-8 lg:pt-16">
      <section className="mb-10 flex flex-col gap-5 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-dark)]">Your selection</p>
          <h1 className="text-5xl font-semibold tracking-[-0.075em] sm:text-7xl">Giỏ <em className="font-serif font-normal text-[var(--accent)]">hàng.</em></h1>
        </div>
        <Link href="/products" className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]">Tiếp tục xem đồ <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
      </section>

      {!hasItems ? (
        <section className="rounded-[30px] border border-dashed border-[#cfc5b6] bg-[#fffdf9] px-6 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#ebe5dc] text-[var(--muted)]"><Icon name="bag" className="h-7 w-7" /></div>
          <h2 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">Giỏ đang trống.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">Một món đồ tốt đang chờ bạn chọn. Bắt đầu từ những essentials của folio.</p>
          <Link href="/products" className="mt-7 inline-flex rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent)]">Xem bộ sưu tập</Link>
        </section>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="mb-4 flex items-center justify-between text-xs text-[var(--muted)]"><span>{cart?.totalCount} món đã chọn</span><button onClick={() => { if (window.confirm('Làm trống toàn bộ giỏ hàng?')) clearMutation.mutate(); }} className="font-semibold text-[var(--accent-dark)] hover:underline">Xoá tất cả</button></div>
            <div className="overflow-hidden rounded-[28px] bg-[#fffdf9] ring-1 ring-[var(--line)]">
              {items.map((item, index) => (
                <article key={item.productId} className="flex gap-4 border-b border-[var(--line)] p-5 last:border-b-0 sm:gap-6 sm:p-6">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[20px] sm:h-32 sm:w-32" style={{ backgroundColor: ['#e9b39c', '#c9d7c7', '#d9c5dd', '#e9d49b'][index % 4] }}><span className="font-serif text-4xl italic text-black/30">0{index + 1}</span></div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 py-1"><div><p className="truncate text-base font-semibold tracking-[-0.03em]">{item.name}</p><p className="price mt-1 text-sm text-[var(--muted)]">{formatPrice(item.price)}</p></div><div className="flex items-center justify-between gap-3"><div className="flex items-center rounded-full border border-[var(--line)] bg-[#f5f1ea] p-1"><button aria-label="Giảm số lượng" disabled={item.quantity <= 1 || updateMutation.isPending} onClick={() => updateMutation.mutate({ productId: item.productId, quantity: item.quantity - 1 })} className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-[var(--muted)] hover:bg-white disabled:opacity-30">−</button><span className="w-7 text-center text-xs font-bold">{item.quantity}</span><button aria-label="Tăng số lượng" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ productId: item.productId, quantity: item.quantity + 1 })} className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-[var(--muted)] hover:bg-white">+</button></div><button aria-label={`Xoá ${item.name}`} onClick={() => removeMutation.mutate(item.productId)} className="text-[var(--muted)] transition hover:text-[var(--accent-dark)]"><Icon name="trash" className="h-4 w-4" /></button></div></div>
                  <p className="price hidden self-center text-sm font-semibold sm:block">{formatPrice(item.subtotal)}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="sticky top-[98px] rounded-[28px] bg-[var(--foreground)] p-6 text-[#f8f0e4] shadow-[0_20px_60px_rgba(41,38,33,.12)] sm:p-7">
            <div className="flex items-center justify-between border-b border-white/15 pb-5"><h2 className="text-lg font-semibold tracking-[-0.03em]">Thông tin đơn</h2><span className="text-xs text-[#b8c8bd]">#{String(cart?.totalCount).padStart(2, '0')}</span></div>
            <div className="space-y-3 border-b border-white/15 py-5 text-sm"><div className="flex justify-between text-[#c6c5bc]"><span>Tạm tính</span><span className="price">{formatPrice(cart?.totalAmount || 0)}</span></div><div className="flex justify-between text-[#c6c5bc]"><span>Phí vận chuyển</span><span className="text-[#b8c8bd]">Miễn phí</span></div><div className="flex justify-between pt-3 text-base font-semibold"><span>Tổng cộng</span><span className="price text-[#e9a18f]">{formatPrice(cart?.totalAmount || 0)}</span></div></div>
            <form onSubmit={(event) => { event.preventDefault(); if (!customerName.trim() || !phone.trim()) { toast.error('Nhập tên và số điện thoại'); return; } orderMutation.mutate(); }} className="space-y-3 pt-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b8c8bd]">Nhận hàng</p><input aria-label="Tên người nhận" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Tên người nhận" className="h-11 w-full rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#e9a18f]" /><input aria-label="Số điện thoại" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Số điện thoại" inputMode="tel" className="h-11 w-full rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#e9a18f]" /><button disabled={orderMutation.isPending} type="submit" className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e9a18f] text-sm font-semibold text-[#492820] transition hover:bg-white disabled:cursor-wait disabled:opacity-60">{orderMutation.isPending ? 'Đang tạo đơn...' : 'Đặt hàng'} <Icon name="arrow" className="h-4 w-4" /></button></form>
            <p className="mt-4 text-center text-[11px] leading-5 text-white/40">Thông tin chỉ dùng để xử lý đơn hàng trong bài lab.</p>
          </aside>
        </div>
      )}
    </main>
  );
}

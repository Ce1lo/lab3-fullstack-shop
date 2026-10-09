'use client';

import { useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Icon } from '@/components/Icons';

interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
}

type ApiError = AxiosError<{ error?: string }>;

const productColors = ['#e9b39c', '#c9d7c7', '#d9c5dd', '#e9d49b', '#b7ced6', '#e4b8c0'];

function formatPrice(price: number) {
  return `${price.toLocaleString('vi-VN')} đ`;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Áo');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sort, setSort] = useState('featured');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const { data: products = [], isLoading, isError, refetch } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => api.get('/api/products').then((response) => response.data),
  });

  const categories = useMemo(
    () => ['Tất cả', ...Array.from(new Set(products.map((product) => product.category || 'Khác')))],
    [products],
  );

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(normalizedSearch);
      const matchesCategory = selectedCategory === 'Tất cả' || (product.category || 'Khác') === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name, 'vi');
      return a.id - b.id;
    });
  }, [products, search, selectedCategory, sort]);

  const errorMessage = (error: unknown, fallback: string) =>
    (error as ApiError).response?.data?.error || fallback;

  const addMutation = useMutation({
    mutationFn: (payload: { name: string; price: number; category: string }) => api.post('/api/products', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã thêm sản phẩm');
      setName('');
      setPrice('');
    },
    onError: (error: unknown) => toast.error(errorMessage(error, 'Không thể thêm sản phẩm')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']);
      queryClient.setQueryData<Product[]>(['products'], (current = []) => current.filter((product) => product.id !== id));
      return { previousProducts };
    },
    onError: (error: unknown, _id, context) => {
      if (context?.previousProducts) queryClient.setQueryData(['products'], context.previousProducts);
      toast.error(errorMessage(error, 'Không thể xoá sản phẩm'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onSuccess: () => toast.success('Đã xoá sản phẩm'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; name: string; price: number; category: string }) =>
      api.put(`/api/products/${payload.id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã cập nhật sản phẩm');
      setEditingId(null);
    },
    onError: (error: unknown) => toast.error(errorMessage(error, 'Không thể cập nhật sản phẩm')),
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: number) => api.post('/api/cart', { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm vào giỏ');
    },
    onError: (error: unknown) => toast.error(errorMessage(error, 'Không thể thêm vào giỏ')),
  });

  const submitProduct = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedPrice = Number(price);
    if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error('Nhập tên và giá hợp lệ');
      return;
    }
    addMutation.mutate({ name: name.trim(), price: parsedPrice, category });
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditCategory(product.category || 'Khác');
  };

  const submitEdit = (id: number) => {
    const parsedPrice = Number(editPrice);
    if (!editName.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error('Nhập tên và giá hợp lệ');
      return;
    }
    updateMutation.mutate({ id, name: editName.trim(), price: parsedPrice, category: editCategory });
  };

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-12 lg:px-8 lg:pt-16">
      <section className="mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-dark)]">The edit / 06 objects</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[.94] tracking-[-0.075em] sm:text-7xl">
            Đồ dùng có <em className="font-serif font-normal text-[var(--accent)]">ý thức.</em>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">Những món cơ bản được chọn vì cảm giác sử dụng, chất liệu và khả năng ở lại lâu trong nhịp sống của bạn.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--sage)]" />
          {products.length} món đang có sẵn
        </div>
      </section>

      <section className="mb-10 rounded-[28px] bg-[var(--foreground)] p-6 text-[#f8f0e4] shadow-[0_20px_60px_rgba(41,38,33,.12)] sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9a08d]">Thêm vào tuyển chọn</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Một món mới cho hôm nay?</h2>
          </div>
          <form onSubmit={submitProduct} className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] lg:min-w-[680px]">
            <input aria-label="Tên sản phẩm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên sản phẩm" className="h-11 rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-[#e9a18f]" />
            <input aria-label="Giá sản phẩm" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Giá / VNĐ" type="number" min="1" className="h-11 rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-[#e9a18f]" />
            <select aria-label="Danh mục" value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none focus:border-[#e9a18f]">
              <option className="text-black">Áo</option><option className="text-black">Quần</option><option className="text-black">Áo khoác</option><option className="text-black">Phụ kiện</option><option className="text-black">Khác</option>
            </select>
            <button disabled={addMutation.isPending} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#e9a18f] px-5 text-sm font-semibold text-[#492820] transition hover:bg-white disabled:cursor-wait disabled:opacity-60" type="submit">
              <Icon name="plus" className="h-4 w-4" /> Thêm
            </button>
          </form>
        </div>
      </section>

      <section aria-label="Bộ lọc sản phẩm" className="mb-8 flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((item) => <button key={item} onClick={() => setSelectedCategory(item)} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${selectedCategory === item ? 'bg-[var(--foreground)] text-white' : 'bg-[#ebe5dc] text-[var(--muted)] hover:bg-[#e1d8cc]'}`}>{item}</button>)}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[#fffdf9] px-4 text-sm text-[var(--muted)] focus-within:border-[var(--accent)]">
            <Icon name="search" className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm sản phẩm" className="w-32 bg-transparent outline-none placeholder:text-[#a3a19b]" />
          </label>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-full border border-[var(--line)] bg-[#fffdf9] px-4 text-xs font-semibold text-[var(--muted)] outline-none">
            <option value="featured">Mới nhất</option><option value="price-low">Giá thấp đến cao</option><option value="price-high">Giá cao đến thấp</option><option value="name">Tên A–Z</option>
          </select>
        </div>
      </section>

      {isError && <div className="mb-8 flex items-center justify-between rounded-2xl bg-[#f6d9d2] px-5 py-4 text-sm text-[#8e392d]"><span>Không thể kết nối backend. Kiểm tra server tại port 5000.</span><button onClick={() => refetch()} className="font-semibold underline underline-offset-4">Thử lại</button></div>}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-[390px] animate-pulse rounded-[24px] bg-[#e8e1d7]" />)}</div>
      ) : visibleProducts.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#cfc5b6] bg-[#fffdf9] px-6 py-20 text-center"><p className="text-lg font-semibold">Không có món nào phù hợp</p><p className="mt-2 text-sm text-[var(--muted)]">Thử đổi từ khoá hoặc bộ lọc.</p></div>
      ) : (
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product, index) => {
            const isEditing = editingId === product.id;
            return <article key={product.id} className="group">
              <div className="relative mb-4 aspect-[.9] overflow-hidden rounded-[24px] p-6" style={{ backgroundColor: productColors[index % productColors.length] }}>
                <div className="absolute left-6 top-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-black/55"><span className="h-2 w-2 rounded-full bg-black/50" /> {product.category || 'Khác'}</div>
                <span className="absolute right-6 top-6 font-serif text-3xl italic text-black/30">0{index + 1}</span>
                <div className="absolute inset-0 flex items-center justify-center"><div className="h-40 w-40 rounded-[42px] border border-black/10 bg-white/30 shadow-[inset_0_10px_30px_rgba(255,255,255,.2)] transition duration-500 group-hover:rotate-6 group-hover:scale-110" /></div>
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between"><span className="max-w-[170px] text-2xl font-semibold leading-[.95] tracking-[-0.06em] text-black/70">{product.name}</span><span className="rounded-full bg-white/45 px-3 py-1 text-[10px] font-bold text-black/60">in stock</span></div>
              </div>
              {isEditing ? <div className="space-y-2 rounded-2xl bg-[#fffdf9] p-4 ring-1 ring-[var(--line)]"><input value={editName} onChange={(event) => setEditName(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--accent)]" /><div className="grid grid-cols-2 gap-2"><input value={editPrice} onChange={(event) => setEditPrice(event.target.value)} type="number" min="1" className="h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--accent)]" /><select value={editCategory} onChange={(event) => setEditCategory(event.target.value)} className="h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--accent)]"><option>Áo</option><option>Quần</option><option>Áo khoác</option><option>Phụ kiện</option><option>Khác</option></select></div><div className="flex gap-2 pt-1"><button onClick={() => submitEdit(product.id)} className="flex-1 rounded-lg bg-[var(--foreground)] py-2 text-xs font-semibold text-white">Lưu</button><button onClick={() => setEditingId(null)} className="rounded-lg bg-[#ebe5dc] px-4 py-2 text-xs font-semibold">Huỷ</button></div></div> : <><div className="flex items-start justify-between gap-3"><div><p className="text-base font-semibold tracking-[-0.03em]">{product.name}</p><p className="price mt-1 text-sm text-[var(--muted)]">{formatPrice(product.price)}</p></div><button aria-label={`Thêm ${product.name} vào giỏ`} onClick={() => addToCartMutation.mutate(product.id)} disabled={addToCartMutation.isPending} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-white transition hover:bg-[var(--accent)] disabled:opacity-50"><Icon name="bag" className="h-4 w-4" /></button></div><div className="mt-4 flex gap-3 text-xs font-semibold text-[var(--muted)]"><button onClick={() => startEdit(product)} className="inline-flex items-center gap-1 hover:text-[var(--foreground)]"><Icon name="edit" className="h-3.5 w-3.5" /> Sửa</button><button onClick={() => { if (window.confirm(`Xoá ${product.name}?`)) deleteMutation.mutate(product.id); }} className="inline-flex items-center gap-1 hover:text-[var(--accent-dark)]"><Icon name="trash" className="h-3.5 w-3.5" /> Xoá</button></div></>}
            </article>;
          })}
        </div>
      )}
    </main>
  );
}

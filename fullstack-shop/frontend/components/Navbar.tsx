'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Icon } from './Icons';

interface CartResponse {
  totalCount: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: cart } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: () => api.get('/api/cart').then((response) => response.data),
    staleTime: 2000,
  });

  const isProducts = pathname.startsWith('/products');
  const isCart = pathname.startsWith('/cart');

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#f5f1ea]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Folio Shop trang chủ">
          <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[var(--foreground)] text-sm font-bold tracking-[-0.08em] text-[#f7efe4] transition-transform group-hover:rotate-[-5deg]">
            FS
          </span>
          <span className="hidden text-[15px] font-semibold tracking-[-0.02em] sm:block">folio / shop</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium" aria-label="Điều hướng chính">
          <Link
            href="/products"
            className={`rounded-full px-4 py-2 transition-colors ${isProducts ? 'bg-[#e8dfd4] text-[var(--foreground)]' : 'text-[var(--muted)] hover:bg-[#ebe5dc] hover:text-[var(--foreground)]'}`}
          >
            Cửa hàng
          </Link>
          <Link
            href="/cart"
            className={`relative flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${isCart ? 'bg-[#e8dfd4] text-[var(--foreground)]' : 'text-[var(--muted)] hover:bg-[#ebe5dc] hover:text-[var(--foreground)]'}`}
          >
            <Icon name="bag" className="h-[17px] w-[17px]" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">
              {cart?.totalCount ?? 0}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

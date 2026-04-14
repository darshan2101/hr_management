function Header({ title }) {
  return (
    <header className="flex items-center justify-between border-b border-ink-100 bg-white px-10 py-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">HR Management</p>
        <h2 className="text-2xl font-semibold text-ink-900">{title}</h2>
      </div>
    </header>
  );
}

export default Header;

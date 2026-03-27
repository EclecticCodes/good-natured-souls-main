"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";

type Tab = "overview" | "orders" | "wishlist" | "addresses" | "settings";

type Order = {
  id: number;
  stripeId: string;
  amount: number;
  status: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
};

type WishlistItem = {
  id: number;
  product_id: string;
  product_name: string;
  product_type: string;
  product_price: number;
};

type Address = {
  id: number;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
};

type Customer = {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  genres: string[];
  favorite_artists: string[];
  avatar?: string;
};

const GENRES = ["Hip-Hop", "R&B", "Soul", "Jazz", "Afrobeats", "Pop", "Electronic", "Gospel", "Reggae", "Other"];
// GNS_ARTISTS fetched from Strapi dynamically
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [gnsArtists, setGnsArtists] = useState<string[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: "Home", name: "", line1: "", line2: "", city: "", state: "NY", zip: "", country: "US", is_default: false });
  const [settingsForm, setSettingsForm] = useState({ name: "", phone: "", birthday: "", genres: [] as string[], favorite_artists: [] as string[] });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const artistsRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'https://gns-cms-production.up.railway.app'}/api/artists?fields=name&pagination[limit]=50`);
      const artistsData = await artistsRes.json();
      setGnsArtists((artistsData.data || []).map((a: any) => a.attributes?.name || a.name).filter(Boolean));

      const [ordersRes, wishlistRes, addressesRes, profileRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/wishlist"),
        fetch("/api/addresses"),
        fetch("/api/profile"),
      ]);
      const [ordersData, wishlistData, addressesData, profileData] = await Promise.all([
        ordersRes.json(), wishlistRes.json(), addressesRes.json(), profileRes.json(),
      ]);
      setOrders(ordersData.orders || []);
      setWishlist(wishlistData.items || []);
      setAddresses(addressesData.addresses || []);
      if (profileData.customer) {
        const c = profileData.customer;
        setCustomer(c);
        setSettingsForm({
          name: c.name || "",
          phone: c.phone || "",
          birthday: c.birthday ? c.birthday.slice(0, 10) : "",
          genres: c.genres || [],
          favorite_artists: c.favorite_artists || [],
        });
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (status === "authenticated") fetchAll(); }, [status, fetchAll]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsForm),
    });
    setSaving(false);
    showToast("Settings saved");
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });
    setSaving(false);
    setShowAddAddress(false);
    setAddressForm({ label: "Home", name: "", line1: "", line2: "", city: "", state: "NY", zip: "", country: "US", is_default: false });
    fetchAll();
    showToast("Address saved");
  };

  const handleDeleteAddress = async (id: number) => {
    await fetch("/api/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAll();
    showToast("Address removed");
  };

  const handleRemoveWishlist = async (productId: string) => {
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    fetchAll();
    showToast("Removed from wishlist");
  };

  const toggleArray = (field: "genres" | "favorite_artists", value: string) => {
    setSettingsForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
    }));
  };

  const inputClass = "w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600";
  const labelClass = "font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2";

  if (status === "loading" || loading) return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-oswald text-gray-500 tracking-widest animate-pulse">LOADING...</p>
      </div>
    </PageWrapper>
  );

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders", count: orders.length },
    { id: "wishlist", label: "Wishlist", count: wishlist.length },
    { id: "addresses", label: "Addresses" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <PageWrapper>
      <main className="min-h-screen">
        <Header><h1 className="font-oswald text-4xl font-bold">My Account</h1></Header>

        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Profile card */}
          <div className="border border-secondaryInteraction p-6 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondaryInteraction flex items-center justify-center flex-shrink-0">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="font-oswald text-2xl text-accent">{session?.user?.name?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-oswald text-xl font-bold">{session?.user?.name}</p>
              <p className="text-gray-500 text-sm">{session?.user?.email}</p>
              <span className="bg-accent text-primary font-oswald text-xs px-2 py-1 tracking-widest mt-1 inline-block">FAN</span>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="border border-secondaryInteraction text-gray-500 font-oswald text-xs px-4 py-2 tracking-widest hover:border-red-500 hover:text-red-500 transition-colors flex-shrink-0">
              SIGN OUT
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-secondaryInteraction mb-6 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={"flex-shrink-0 py-3 px-4 font-oswald text-xs tracking-widest font-bold transition-colors flex items-center gap-2 border-b-2 -mb-px " +
                  (tab === t.id ? "border-accent text-accent" : "border-transparent text-gray-600 hover:text-gray-400")}>
                {t.label.toUpperCase()}
                {t.count !== undefined && t.count > 0 && (
                  <span className="bg-accent text-primary text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{fontSize:9}}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Orders", value: orders.length, tab: "orders" as Tab },
                  { label: "Wishlist", value: wishlist.length, tab: "wishlist" as Tab },
                  { label: "Addresses", value: addresses.length, tab: "addresses" as Tab },
                  { label: "Total Spent", value: `$${orders.reduce((s, o) => s + o.amount, 0).toFixed(2)}`, tab: "orders" as Tab },
                ].map(stat => (
                  <button key={stat.label} onClick={() => setTab(stat.tab)}
                    className="border border-secondaryInteraction p-4 text-left hover:border-accent transition-colors">
                    <div className="font-oswald text-2xl font-bold text-accent">{stat.value}</div>
                    <div className="font-oswald text-xs text-gray-500 tracking-widest uppercase mt-1">{stat.label}</div>
                  </button>
                ))}
              </div>

              {/* Recent order */}
              {orders.length > 0 && (
                <div className="border border-secondaryInteraction p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-oswald text-sm font-bold tracking-widest uppercase">Latest Order</h3>
                    <button onClick={() => setTab("orders")} className="font-oswald text-xs text-accent tracking-widest hover:underline">VIEW ALL →</button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      {orders[0].items.map((item, i) => (
                        <p key={i} className="text-gray-400 text-sm">{item.name} x{item.quantity}</p>
                      ))}
                      <p className="text-gray-600 text-xs mt-1">{orders[0].date}</p>
                    </div>
                    <span className="font-oswald text-accent font-bold">${orders[0].amount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <a href="/store" className="flex-1 border border-secondaryInteraction text-white font-oswald text-xs px-4 py-3 tracking-widest hover:border-accent transition-colors text-center">BROWSE STORE</a>
                <a href="/artists" className="flex-1 border border-secondaryInteraction text-white font-oswald text-xs px-4 py-3 tracking-widest hover:border-accent transition-colors text-center">OUR ARTISTS</a>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab === "orders" && (
            <div className="flex flex-col gap-4">
              {orders.length === 0 ? (
                <div className="border border-secondaryInteraction p-12 text-center">
                  <p className="font-oswald text-gray-500 tracking-widest text-sm mb-3">NO ORDERS YET</p>
                  <a href="/store" className="font-oswald text-xs text-accent tracking-widest hover:underline">VISIT STORE →</a>
                </div>
              ) : orders.map(order => (
                <div key={order.id} className="border border-secondaryInteraction p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className={"font-oswald text-xs px-2 py-1 tracking-widest " + (order.status === "paid" ? "bg-green-900/50 text-green-400" : "bg-secondaryInteraction text-gray-500")}>
                        {order.status.toUpperCase()}
                      </span>
                      <p className="text-gray-600 text-xs mt-1">{order.date}</p>
                    </div>
                    <span className="font-oswald text-accent font-bold text-lg">${order.amount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-secondaryInteraction pt-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-gray-400">{item.name} <span className="text-gray-600">x{item.quantity}</span></span>
                        <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WISHLIST */}
          {tab === "wishlist" && (
            <div className="flex flex-col gap-3">
              {wishlist.length === 0 ? (
                <div className="border border-secondaryInteraction p-12 text-center">
                  <p className="font-oswald text-gray-500 tracking-widest text-sm mb-3">YOUR WISHLIST IS EMPTY</p>
                  <a href="/store" className="font-oswald text-xs text-accent tracking-widest hover:underline">BROWSE STORE →</a>
                </div>
              ) : wishlist.map(item => (
                <div key={item.id} className="border border-secondaryInteraction p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-oswald text-sm font-bold">{item.product_name}</p>
                    <p className="text-gray-500 text-xs capitalize mt-0.5">{item.product_type} · ${item.product_price}</p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <a href="/store" className="font-oswald text-xs text-accent tracking-widest hover:underline">VIEW</a>
                    <button onClick={() => handleRemoveWishlist(item.product_id)} className="font-oswald text-xs text-gray-600 tracking-widest hover:text-red-500 transition-colors">REMOVE</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ADDRESSES */}
          {tab === "addresses" && (
            <div className="flex flex-col gap-4">
              {addresses.map(addr => (
                <div key={addr.id} className={"border p-4 " + (addr.is_default ? "border-accent" : "border-secondaryInteraction")}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-oswald text-xs font-bold tracking-widest">{addr.label.toUpperCase()}</span>
                      {addr.is_default && <span className="font-oswald text-xs text-accent tracking-widest">· DEFAULT</span>}
                    </div>
                    <button onClick={() => handleDeleteAddress(addr.id)} className="font-oswald text-xs text-gray-600 tracking-widest hover:text-red-500 transition-colors">REMOVE</button>
                  </div>
                  <p className="text-gray-300 text-sm">{addr.name}</p>
                  <p className="text-gray-500 text-sm">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                  <p className="text-gray-500 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                </div>
              ))}

              {!showAddAddress ? (
                <button onClick={() => setShowAddAddress(true)} className="border border-dashed border-secondaryInteraction p-4 font-oswald text-xs text-gray-500 tracking-widest hover:border-accent hover:text-accent transition-colors w-full">
                  + ADD NEW ADDRESS
                </button>
              ) : (
                <form onSubmit={handleAddAddress} className="border border-accent p-5 flex flex-col gap-4">
                  <h3 className="font-oswald text-sm font-bold tracking-widest uppercase text-accent">New Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Label</label>
                      <select value={addressForm.label} onChange={e => setAddressForm(f => ({ ...f, label: e.target.value }))} className={inputClass}>
                        {["Home", "Work", "Other"].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input value={addressForm.name} onChange={e => setAddressForm(f => ({ ...f, name: e.target.value }))} placeholder="Name on address" className={inputClass} required />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Address Line 1</label>
                    <input value={addressForm.line1} onChange={e => setAddressForm(f => ({ ...f, line1: e.target.value }))} placeholder="Street address" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Address Line 2</label>
                    <input value={addressForm.line2} onChange={e => setAddressForm(f => ({ ...f, line2: e.target.value }))} placeholder="Apt, suite, unit (optional)" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className={labelClass}>City</label>
                      <input value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <select value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))} className={inputClass}>
                        {US_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>ZIP</label>
                      <input value={addressForm.zip} onChange={e => setAddressForm(f => ({ ...f, zip: e.target.value }))} placeholder="10001" className={inputClass} required />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={addressForm.is_default} onChange={e => setAddressForm(f => ({ ...f, is_default: e.target.checked }))} className="accent-accent" />
                    <span className="font-oswald text-xs text-gray-500 tracking-widest">SET AS DEFAULT</span>
                  </label>
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="flex-1 bg-accent text-primary font-oswald font-bold text-sm py-3 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-50">
                      {saving ? "SAVING..." : "SAVE ADDRESS"}
                    </button>
                    <button type="button" onClick={() => setShowAddAddress(false)} className="border border-secondaryInteraction text-gray-500 font-oswald text-sm px-6 py-3 tracking-widest hover:border-white transition-colors">
                      CANCEL
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {tab === "settings" && (
            <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
              <div className="border border-secondaryInteraction p-5">
                <h3 className="font-oswald text-sm font-bold tracking-widest uppercase text-accent mb-4">Personal Info</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelClass}>Display Name</label>
                    <input value={settingsForm.name} onChange={e => setSettingsForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input value={settingsForm.phone} onChange={e => setSettingsForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Birthday</label>
                      {settingsForm.birthday ? (
                        <div className="flex items-center justify-between border border-secondaryInteraction px-4 py-3">
                          <span className="text-white text-sm">
                            {new Date(settingsForm.birthday + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                          <button type="button" onClick={() => setSettingsForm(f => ({ ...f, birthday: '' }))}
                            className="font-oswald text-xs text-gray-600 tracking-widest hover:text-accent transition-colors">CHANGE</button>
                        </div>
                      ) : (
                        <input type="date" value={settingsForm.birthday} onChange={e => setSettingsForm(f => ({ ...f, birthday: e.target.value }))} className={inputClass} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-secondaryInteraction p-5">
                <h3 className="font-oswald text-sm font-bold tracking-widest uppercase text-accent mb-4">Favorite GNS Artists</h3>
                <div className="flex flex-wrap gap-2">
                  {gnsArtists.map(artist => (
                    <button key={artist} type="button" onClick={() => toggleArray("favorite_artists", artist)}
                      className={"font-oswald text-xs px-3 py-2 border tracking-widest transition-colors " + (settingsForm.favorite_artists.includes(artist) ? "border-accent text-accent bg-secondaryInteraction" : "border-secondaryInteraction text-gray-500 hover:border-accent")}>
                      {artist}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-secondaryInteraction p-5">
                <h3 className="font-oswald text-sm font-bold tracking-widest uppercase text-accent mb-4">Music Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => (
                    <button key={genre} type="button" onClick={() => toggleArray("genres", genre)}
                      className={"font-oswald text-xs px-3 py-2 border tracking-widest transition-colors " + (settingsForm.genres.includes(genre) ? "border-accent text-accent bg-secondaryInteraction" : "border-secondaryInteraction text-gray-500 hover:border-accent")}>
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving} className="bg-accent text-primary font-oswald font-bold text-sm py-4 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-50">
                {saving ? "SAVING..." : "SAVE SETTINGS"}
              </button>
            </form>
          )}

        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary border border-accent text-white font-oswald text-xs px-6 py-3 tracking-widest z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </PageWrapper>
  );
}

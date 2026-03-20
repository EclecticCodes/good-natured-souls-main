"use client";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";

const GENRES = ["Hip-Hop", "R&B", "Soul", "Jazz", "Afrobeats", "Pop", "Electronic", "Gospel", "Reggae", "Other"];
const GNS_ARTISTS = ["Eclectic Sage", "Prince Inspiration", "Tiarra", "Jewel$ From The X"];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<{id:number;message:string;date:string;read:boolean;type:string;link?:string;linkLabel?:string}[]>([
    { id: 1, message: "Welcome to Good Natured Souls!", date: "Today", read: false, type: "welcome" },
    { id: 2, message: "New release: STILL ALIVE. by Prince Inspiration", date: "Mar 18, 2026", read: false, type: "release" },
    { id: 3, message: "Eclectic Sage is performing at Secret Pour", date: "Mar 18, 2026", read: true, type: "show" },
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "", lastName: "", phone: "",
    birthday: "",
    genres: [] as string[],
    favoriteArtists: [] as string[],
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated") {
      fetch("/api/orders")
        .then(res => res.json())
        .then(data => setOrders(data.orders || []));
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [status, router]);


  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const toggleArray = (field: "genres" | "favoriteArtists", value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (status === "loading") return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-oswald text-gray-500 tracking-widest animate-pulse">LOADING...</p>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <main className="min-h-screen">
        <Header>
          <h1 className="font-oswald text-4xl font-bold">My Profile</h1>
        </Header>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="border border-secondaryInteraction p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-secondaryInteraction flex items-center justify-center">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="font-oswald text-2xl text-accent">{session?.user?.name?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>
              <div>
                <p className="font-oswald text-xl font-bold">{session?.user?.name}</p>
                <p className="text-gray-500 text-sm">{session?.user?.email}</p>
                <span className="bg-accent text-primary font-oswald text-xs px-2 py-1 tracking-widest mt-1 inline-block">FAN</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="border border-secondaryInteraction p-6">
              <h2 className="font-oswald text-lg font-bold tracking-widest uppercase mb-4 text-accent">Personal Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">First Name</label>
                  <input type="text" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} placeholder="First" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" />
                </div>
                <div>
                  <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Last Name</label>
                  <input type="text" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} placeholder="Last" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" />
                </div>
                <div>
                  <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Phone</label>
                  <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600" />
                </div>
                <div>
                  <label className="font-oswald text-xs tracking-widest text-gray-500 uppercase block mb-2">Birthday</label>
                  <input type="date" value={profile.birthday} onChange={e => setProfile(p => ({ ...p, birthday: e.target.value }))} className="w-full bg-primary border border-secondaryInteraction text-white px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" />
                </div>
              </div>
            </div>

            <div className="border border-secondaryInteraction p-6">
              <h2 className="font-oswald text-lg font-bold tracking-widest uppercase mb-4 text-accent">Favorite GNS Artists</h2>
              <div className="flex flex-wrap gap-2">
                {GNS_ARTISTS.map(artist => (
                  <button key={artist} type="button" onClick={() => toggleArray("favoriteArtists", artist)} className={"font-oswald text-xs px-3 py-2 border tracking-widest transition-colors " + (profile.favoriteArtists.includes(artist) ? "border-accent text-accent bg-secondaryInteraction" : "border-secondaryInteraction text-gray-500 hover:border-accent")}>
                    {artist}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-secondaryInteraction p-6">
              <h2 className="font-oswald text-lg font-bold tracking-widest uppercase mb-4 text-accent">Music Preferences</h2>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (
                  <button key={genre} type="button" onClick={() => toggleArray("genres", genre)} className={"font-oswald text-xs px-3 py-2 border tracking-widest transition-colors " + (profile.genres.includes(genre) ? "border-accent text-accent bg-secondaryInteraction" : "border-secondaryInteraction text-gray-500 hover:border-accent")}>
                    {genre}
                  </button>
                ))}
              </div>
            </div>



            <div className="border border-secondaryInteraction p-6">
              <h2 className="font-oswald text-lg font-bold tracking-widest uppercase mb-4 text-accent">Past Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-6 border border-secondaryInteraction">
                  <p className="font-oswald text-gray-500 tracking-widest text-sm">NO ORDERS YET</p>
                  <a href="/store" className="font-oswald text-xs text-accent tracking-widest hover:underline mt-2 inline-block">VISIT STORE</a>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border border-secondaryInteraction p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-oswald text-sm font-bold">${order.amount.toFixed(2)}</span>
                        <span className={"font-oswald text-xs px-2 py-1 tracking-widest " + (order.status === "succeeded" ? "bg-green-900 text-green-400" : "bg-secondaryInteraction text-gray-500")}>{order.status.toUpperCase()}</span>
                      </div>
                      <p className="text-gray-600 text-xs">{order.date}</p>
                      {order.items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-secondaryInteraction">
                          {order.items.map((item: any, i: number) => (
                            <p key={i} className="text-gray-400 text-xs">{item.name} x{item.quantity}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-secondaryInteraction p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-oswald text-lg font-bold tracking-widest uppercase text-accent">
                  Notifications {unreadCount > 0 && <span className="ml-2 bg-accent text-primary text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                </h2>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="font-oswald text-xs text-gray-500 tracking-widest hover:text-accent transition-colors">MARK ALL READ</button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {notifications.map(notif => (
                  <div key={notif.id} className={"flex items-start gap-3 p-3 border transition-colors " + (notif.read ? "border-secondaryInteraction opacity-60" : "border-accent")}>
                    <div className={"w-2 h-2 rounded-full mt-1.5 flex-shrink-0 " + (notif.read ? "bg-gray-600" : "bg-accent")} />
                    <div className="flex-1">
                      <p className="text-sm text-white">{notif.message}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-600 text-xs">{notif.date}</p>
                        {notif.link && (
                          <a href={notif.link} target={notif.link.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" className="font-oswald text-xs text-accent hover:underline tracking-widest">{notif.linkLabel} →</a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-secondaryInteraction p-6">
              <h2 className="font-oswald text-lg font-bold tracking-widest uppercase mb-4 text-accent">My Wishlist</h2>
              {(() => {
                try {
                  const saved = localStorage.getItem("gns-wishlist");
                  const items = saved ? JSON.parse(saved) : [];
                  return items.length === 0 ? (
                    <div className="text-center py-6 border border-secondaryInteraction">
                      <p className="font-oswald text-gray-500 tracking-widest text-sm">NO ITEMS IN WISHLIST</p>
                      <a href="/store" className="font-oswald text-xs text-accent tracking-widest hover:underline mt-2 inline-block">VISIT STORE</a>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between border border-secondaryInteraction p-3">
                          <div>
                            <p className="font-oswald text-sm font-bold">{item.name}</p>
                            <p className="text-gray-500 text-xs capitalize">{item.type}</p>
                          </div>
                          <a href="/store" className="font-oswald text-xs text-accent tracking-widest hover:underline">VIEW</a>
                        </div>
                      ))}
                    </div>
                  );
                } catch { return null; }
              })()}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 bg-accent text-primary font-oswald font-bold text-sm py-4 tracking-widest hover:bg-accentInteraction transition-colors disabled:opacity-50">
                {loading ? "SAVING..." : saved ? "SAVED!" : "SAVE CHANGES"}
              </button>
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="border border-secondaryInteraction text-gray-500 font-oswald text-sm px-6 py-4 tracking-widest hover:border-red-500 hover:text-red-500 transition-colors">
                SIGN OUT
              </button>
            </div>
          </form>
        </div>
      </main>
    </PageWrapper>
  );
}

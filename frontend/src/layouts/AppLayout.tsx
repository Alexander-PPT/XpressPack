import { Outlet } from 'react-router-dom';
import SideNav from '../components/SideNav';

export default function AppLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      <SideNav />
      <main className="px-6 py-10 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

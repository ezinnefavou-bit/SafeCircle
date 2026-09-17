import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 text-center">
      <ShieldAlert size={40} className="text-brand-600" />

      <h2 className="mt-1 text-lg font-semibold text-ink-800">
        Page Not Found
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        Looks like you've wandered outside your community.
      </p>
      <Link
        to="/home"
        className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Back Home
      </Link>
    </div>
  );
}

export default NotFound;

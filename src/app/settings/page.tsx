"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Check,
  User,
  Shield,
  Palette,
} from "lucide-react";
import { useThemeStore, type Theme } from "@/store/themeStore";
import { useAuthStore } from "@/store";
import {
  reauthenticateUser,
  updateUserPassword,
  deleteUserAccount,
  hasPasswordProvider,
  hasGoogleProvider,
  logOut,
} from "@/lib/firebase";
import { useToast } from "@/components/shared";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useThemeStore();
  const { user, logout: storeLogout } = useAuthStore();
  const { addToast } = useToast();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Provider state
  const [hasPassword, setHasPassword] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(false);

  useEffect(() => {
    setHasPassword(hasPasswordProvider());
    setHasGoogle(hasGoogleProvider());
  }, []);

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // Re-authenticate first if user has password provider
      if (hasPassword && currentPassword) {
        const reauth = await reauthenticateUser(currentPassword);
        if (!reauth.success) {
          addToast(getErrorMessage(reauth.error?.message || ""), "error");
          setIsUpdatingPassword(false);
          return;
        }
      }

      // Update password
      const result = await updateUserPassword(newPassword);
      if (result.success) {
        addToast("Password updated successfully", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setHasPassword(true);
      } else {
        addToast(getErrorMessage(result.error?.message || ""), "error");
      }
    } catch {
      addToast("Failed to update password", "error");
    }

    setIsUpdatingPassword(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      addToast('Please type "DELETE" to confirm', "error");
      return;
    }

    setIsDeleting(true);

    try {
      // Re-authenticate if needed
      if (hasPassword && deletePassword) {
        const reauth = await reauthenticateUser(deletePassword);
        if (!reauth.success) {
          addToast(getErrorMessage(reauth.error?.message || ""), "error");
          setIsDeleting(false);
          return;
        }
      }

      // Delete account
      const result = await deleteUserAccount();
      if (result.success) {
        storeLogout();
        addToast("Account deleted successfully", "success");
        router.push("/login");
      } else {
        addToast(getErrorMessage(result.error?.message || ""), "error");
      }
    } catch {
      addToast("Failed to delete account", "error");
    }

    setIsDeleting(false);
  };

  const handleLogout = async () => {
    await logOut();
    storeLogout();
    router.push("/login");
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        resolvedTheme === "dark"
          ? "bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-40 border-b backdrop-blur-xl",
          resolvedTheme === "dark"
            ? "bg-zinc-950/80 border-zinc-800"
            : "bg-white/80 border-gray-200"
        )}
      >
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={cn(
              "p-2 rounded-full transition-colors",
              resolvedTheme === "dark"
                ? "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1
            className={cn(
              "text-xl font-bold",
              resolvedTheme === "dark" ? "text-white" : "text-zinc-900"
            )}
          >
            Settings
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* User Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl p-6 border",
            resolvedTheme === "dark"
              ? "bg-zinc-900/50 border-zinc-800"
              : "bg-white border-gray-200 shadow-sm"
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center overflow-hidden",
                resolvedTheme === "dark" ? "bg-zinc-800" : "bg-gray-100"
              )}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-16 h-16 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User
                  className={cn(
                    "w-8 h-8",
                    resolvedTheme === "dark" ? "text-zinc-400" : "text-gray-500"
                  )}
                />
              )}
            </div>
            <div className="flex-1">
              <h2
                className={cn(
                  "text-lg font-semibold",
                  resolvedTheme === "dark" ? "text-white" : "text-zinc-900"
                )}
              >
                {user?.displayName || "User"}
              </h2>
              <p
                className={cn(
                  "text-sm",
                  resolvedTheme === "dark" ? "text-zinc-400" : "text-gray-500"
                )}
              >
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {hasPassword && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      resolvedTheme === "dark"
                        ? "bg-zinc-700 text-zinc-300"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    Email
                  </span>
                )}
                {hasGoogle && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      resolvedTheme === "dark"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-blue-100 text-blue-600"
                    )}
                  >
                    Google
                  </span>
                )}
              </div>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              Sign Out
            </button>
          </div>
        </motion.section>

        {/* Theme Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "rounded-2xl p-6 border",
            resolvedTheme === "dark"
              ? "bg-zinc-900/50 border-zinc-800"
              : "bg-white border-gray-200 shadow-sm"
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary-500/20">
              <Palette className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h2
                className={cn(
                  "text-lg font-semibold",
                  resolvedTheme === "dark" ? "text-white" : "text-zinc-900"
                )}
              >
                Appearance
              </h2>
              <p
                className={cn(
                  "text-sm",
                  resolvedTheme === "dark" ? "text-zinc-400" : "text-gray-500"
                )}
              >
                Customize how the app looks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    isActive
                      ? "border-primary-500 bg-primary-500/10"
                      : resolvedTheme === "dark"
                      ? "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      isActive
                        ? "text-primary-500"
                        : resolvedTheme === "dark"
                        ? "text-zinc-400"
                        : "text-gray-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive
                        ? "text-primary-500"
                        : resolvedTheme === "dark"
                        ? "text-zinc-300"
                        : "text-gray-700"
                    )}
                  >
                    {option.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-primary-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Password Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-2xl p-6 border",
            resolvedTheme === "dark"
              ? "bg-zinc-900/50 border-zinc-800"
              : "bg-white border-gray-200 shadow-sm"
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2
                className={cn(
                  "text-lg font-semibold",
                  resolvedTheme === "dark" ? "text-white" : "text-zinc-900"
                )}
              >
                {hasPassword ? "Update Password" : "Create Password"}
              </h2>
              <p
                className={cn(
                  "text-sm",
                  resolvedTheme === "dark" ? "text-zinc-400" : "text-gray-500"
                )}
              >
                {hasPassword
                  ? "Change your account password"
                  : "Add a password to sign in with email"}
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {hasPassword && (
              <div>
                <label
                  className={cn(
                    "block text-sm font-medium mb-2",
                    resolvedTheme === "dark" ? "text-zinc-300" : "text-gray-700"
                  )}
                >
                  Current Password
                </label>
                <div className="relative">
                  <Lock
                    className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                      resolvedTheme === "dark"
                        ? "text-zinc-500"
                        : "text-gray-400"
                    )}
                  />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input pl-11 pr-11"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                      resolvedTheme === "dark"
                        ? "text-zinc-500 hover:text-zinc-300"
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label
                className={cn(
                  "block text-sm font-medium mb-2",
                  resolvedTheme === "dark" ? "text-zinc-300" : "text-gray-700"
                )}
              >
                New Password
              </label>
              <div className="relative">
                <Lock
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                    resolvedTheme === "dark" ? "text-zinc-500" : "text-gray-400"
                  )}
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input pl-11 pr-11"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                    resolvedTheme === "dark"
                      ? "text-zinc-500 hover:text-zinc-300"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                className={cn(
                  "block text-sm font-medium mb-2",
                  resolvedTheme === "dark" ? "text-zinc-300" : "text-gray-700"
                )}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                    resolvedTheme === "dark" ? "text-zinc-500" : "text-gray-400"
                  )}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-11 pr-11"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                    resolvedTheme === "dark"
                      ? "text-zinc-500 hover:text-zinc-300"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="btn-primary w-full py-3"
            >
              {isUpdatingPassword ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </span>
              ) : hasPassword ? (
                "Update Password"
              ) : (
                "Create Password"
              )}
            </button>
          </form>
        </motion.section>

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "rounded-2xl p-6 border",
            resolvedTheme === "dark"
              ? "bg-red-500/5 border-red-500/20"
              : "bg-red-50 border-red-200"
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2
                className={cn(
                  "text-lg font-semibold",
                  resolvedTheme === "dark" ? "text-red-400" : "text-red-700"
                )}
              >
                Danger Zone
              </h2>
              <p
                className={cn(
                  "text-sm",
                  resolvedTheme === "dark" ? "text-red-400/70" : "text-red-600"
                )}
              >
                Irreversible and destructive actions
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger w-full py-3 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <div
                className={cn(
                  "p-4 rounded-lg",
                  resolvedTheme === "dark"
                    ? "bg-red-500/10 border border-red-500/20"
                    : "bg-red-100 border border-red-200"
                )}
              >
                <p
                  className={cn(
                    "text-sm",
                    resolvedTheme === "dark" ? "text-red-400" : "text-red-700"
                  )}
                >
                  This action cannot be undone. This will permanently delete
                  your account and all associated data.
                </p>
              </div>

              {hasPassword && (
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-2",
                      resolvedTheme === "dark"
                        ? "text-zinc-300"
                        : "text-gray-700"
                    )}
                  >
                    Enter your password to confirm
                  </label>
                  <div className="relative">
                    <Lock
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                        resolvedTheme === "dark"
                          ? "text-zinc-500"
                          : "text-gray-400"
                      )}
                    />
                    <input
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="input pl-11 pr-11"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                        resolvedTheme === "dark"
                          ? "text-zinc-500 hover:text-zinc-300"
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      {showDeletePassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label
                  className={cn(
                    "block text-sm font-medium mb-2",
                    resolvedTheme === "dark" ? "text-zinc-300" : "text-gray-700"
                  )}
                >
                  Type <span className="font-bold text-red-500">DELETE</span> to
                  confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="input"
                  placeholder="DELETE"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword("");
                    setDeleteConfirmText("");
                  }}
                  className="btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== "DELETE"}
                  className="btn-danger flex-1 py-3 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

function getErrorMessage(errorCode: string): string {
  if (errorCode.includes("wrong-password")) {
    return "Incorrect password. Please try again.";
  }
  if (errorCode.includes("weak-password")) {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (errorCode.includes("requires-recent-login")) {
    return "Please sign out and sign in again before this action.";
  }
  if (errorCode.includes("too-many-requests")) {
    return "Too many attempts. Please try again later.";
  }
  return "An error occurred. Please try again.";
}

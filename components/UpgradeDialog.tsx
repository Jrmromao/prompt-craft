'use client';

import { X, Zap, Crown, TrendingUp } from 'lucide-react';

interface UpgradeDialogProps {
  currentCredits: number;
  requiredCredits: number;
  onClose: () => void;
}

export function UpgradeDialog({ currentCredits, requiredCredits, onClose }: UpgradeDialogProps) {
  const deficit = requiredCredits - currentCredits;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Need More Credits?</h2>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            You need <strong>{requiredCredits} credits</strong> but have{' '}
            <strong>{currentCredits} credits</strong>
          </p>
          <p className="text-sm text-red-600 font-medium mt-1">
            Short by {deficit} credits
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-lg">PRO Plan</h3>
                </div>
                <p className="text-sm text-gray-600">Best value for regular users</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">$19</div>
                <div className="text-sm text-gray-600">/month</div>
              </div>
            </div>

            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>1,000 credits monthly</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Access to GPT-4 & Claude</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Advanced analytics</span>
              </li>
            </ul>

            <a
              href="/pricing"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade to PRO
            </a>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold">Or Buy Credits</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/account?buy=100"
                className="border-2 rounded-lg p-3 hover:border-blue-500 transition-colors text-center"
              >
                <div className="font-bold">100 credits</div>
                <div className="text-sm text-gray-600">$2</div>
              </a>
              <a
                href="/account?buy=500"
                className="border-2 rounded-lg p-3 hover:border-blue-500 transition-colors text-center"
              >
                <div className="font-bold">500 credits</div>
                <div className="text-sm text-gray-600">$10</div>
              </a>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
        >
          Not now
        </button>
      </div>
    </>
  );
}

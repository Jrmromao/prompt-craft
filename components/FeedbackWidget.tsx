'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FeedbackType, FeedbackCategory } from '@prisma/client';

interface FeedbackData {
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  message: string;
  rating?: number;
  email?: string;
}

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [showPulse, setShowPulse] = useState(true);
  const [shouldBounce, setShouldBounce] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);

  // Periodic bounce animation to draw attention
  useEffect(() => {
    const bounceInterval = setInterval(() => {
      if (!isOpen && showPulse) {
        setShouldBounce(true);
        setShowNotificationBadge(true);
        setTimeout(() => {
          setShouldBounce(false);
          setShowNotificationBadge(false);
        }, 3000);
      }
    }, 12000); // Show every 12 seconds

    return () => clearInterval(bounceInterval);
  }, [isOpen, showPulse]);

  const [formData, setFormData] = useState<FeedbackData>({
    type: 'GENERAL_FEEDBACK' as FeedbackType,
    category: 'OTHER' as FeedbackCategory,
    title: '',
    message: '',
    rating: undefined,
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rating: rating > 0 ? rating : undefined,
          url: window.location.href,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Feedback sent!', {
          description: 'Thank you for your feedback. We\'ll review it soon.',
        });
        
        // Reset form
        setFormData({
          type: 'GENERAL_FEEDBACK' as FeedbackType,
          category: 'OTHER' as FeedbackCategory,
          title: '',
          message: '',
          rating: undefined,
          email: '',
        });
        setRating(0);
        setIsOpen(false);
      } else {
        throw new Error(result.error || 'Failed to send feedback');
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to send feedback. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: 'BUG_REPORT', label: '🐛 Bug Report' },
    { value: 'FEATURE_REQUEST', label: '✨ Feature Request' },
    { value: 'GENERAL_FEEDBACK', label: '💬 General Feedback' },
    { value: 'COMPLAINT', label: '😞 Complaint' },
    { value: 'COMPLIMENT', label: '😊 Compliment' },
    { value: 'QUESTION', label: '❓ Question' },
    { value: 'SUGGESTION', label: '💡 Suggestion' },
  ];

  const feedbackCategories = [
    { value: 'UI_UX', label: 'UI/UX' },
    { value: 'PERFORMANCE', label: 'Performance' },
    { value: 'BILLING', label: 'Billing' },
    { value: 'API', label: 'API' },
    { value: 'DOCUMENTATION', label: 'Documentation' },
    { value: 'SECURITY', label: 'Security' },
    { value: 'INTEGRATION', label: 'Integration' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <>
      {/* Floating Button with Effects */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulse Ring Effect */}
        {showPulse && (
          <div className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-75"></div>
        )}
        
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl animate-pulse"></div>
        
        <Button
          onClick={() => {
            setIsOpen(true);
            setShowPulse(false);
          }}
          onMouseEnter={() => setShowPulse(false)}
          className={`relative h-14 w-14 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group ${
            shouldBounce ? 'animate-bounce' : ''
          }`}
          size="icon"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
          
          {/* Notification Badge */}
          {showNotificationBadge && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse">
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping"></div>
            </div>
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Send Feedback
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </Button>
      </div>

      {/* Feedback Modal with Animation */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Send Feedback
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as FeedbackType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as FeedbackCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating (optional)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief summary of your feedback"
                  required
                  maxLength={200}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more about your feedback..."
                  required
                  rows={4}
                  maxLength={2000}
                />
              </div>

              {/* Email (for anonymous users) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.message}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

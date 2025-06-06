import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | PromptCraft',
  description: 'Learn about how we use cookies and similar technologies on PromptCraft',
};

export default function CookiePolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Cookie Policy</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="lead">
          This Cookie Policy explains how PromptCraft ("we", "us", or "our") uses cookies and
          similar technologies to recognize you when you visit our website. It explains what these
          technologies are and why we use them, as well as your rights to control our use of them.
        </p>

        <h2>What are cookies?</h2>
        <p>
          Cookies are small data files that are placed on your computer or mobile device when you
          visit a website. Cookies are widely used by website owners to make their websites work, or
          to work more efficiently, as well as to provide reporting information.
        </p>

        <h2>Why do we use cookies?</h2>
        <p>
          We use cookies for several reasons. Some cookies are required for technical reasons in
          order for our website to operate, and we refer to these as "essential" or "strictly
          necessary" cookies. Other cookies enable us to track and target the interests of our users
          to enhance the experience on our website. Third parties serve cookies through our website
          for analytics and other purposes.
        </p>

        <h2>Types of cookies we use</h2>

        <h3>Essential Cookies</h3>
        <p>
          These cookies are strictly necessary to provide you with services available through our
          website and to use some of its features, such as access to secure areas. Because these
          cookies are strictly necessary to deliver the website, you cannot refuse them without
          impacting how our website functions.
        </p>

        <h3>Analytics Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our website by collecting and
          reporting information anonymously. They help us to know which pages are the most and least
          popular and see how visitors move around the site. All information these cookies collect
          is aggregated and therefore anonymous.
        </p>

        <h3>Functional Cookies</h3>
        <p>
          These cookies enable the website to provide enhanced functionality and personalization.
          They may be set by us or by third-party providers whose services we have added to our
          pages. If you do not allow these cookies, then some or all of these services may not
          function properly.
        </p>

        <h3>Marketing Cookies</h3>
        <p>
          These cookies are used to track visitors across websites. The intention is to display ads
          that are relevant and engaging for the individual user and thereby more valuable for
          publishers and third-party advertisers.
        </p>

        <h3>Preference Cookies</h3>
        <p>
          These cookies allow the website to remember information that changes the way the website
          behaves or looks, like your preferred language or the region you are in.
        </p>

        <h2>How can you control cookies?</h2>
        <p>
          You have the right to decide whether to accept or reject cookies. You can exercise your
          cookie preferences through our cookie consent banner. You can also set or amend your web
          browser controls to accept or refuse cookies. If you choose to reject cookies, you may
          still use our website though your access to some functionality and areas of our website
          may be restricted.
        </p>

        <h2>How often will we update this Cookie Policy?</h2>
        <p>
          We may update this Cookie Policy from time to time in order to reflect, for example,
          changes to the cookies we use or for other operational, legal, or regulatory reasons.
          Please therefore revisit this Cookie Policy regularly to stay informed about our use of
          cookies and related technologies.
        </p>

        <h2>Where can you get further information?</h2>
        <p>
          If you have any questions about our use of cookies or other technologies, please email us
          at privacy@promptcraft.ai or refer to our{' '}
          <a
            href="/privacy-policy"
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Privacy Policy
          </a>
          .
        </p>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

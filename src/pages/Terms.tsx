import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollText } from 'lucide-react';

export default function Terms() {
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/10 mb-4">
              <ScrollText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Terms of Service</h1>
            <p className="mt-2 text-muted-foreground">Last Updated: February 2026</p>
          </div>

          {/* Intro */}
          <Card className="gaming-card border-border/50 mb-6">
            <CardContent className="p-6 md:p-8">
              <p className="text-muted-foreground leading-relaxed">
                Please read these Terms of Service carefully. By registering for or using the SkyServer game server hosting services (whether on the Free Tier or with Paid Add-ons), you ("User") agree to be bound by these Terms of Service ("Terms"). SkyServer ("we", "us", or "the Provider") is a Swiss-based service, and these Terms establish a contract under Swiss law between you and the Provider for use of the SkyServer services. If you do not agree with these Terms, you must not use the services.
              </p>
            </CardContent>
          </Card>

          {/* Legal Content */}
          <Card className="gaming-card border-border/50">
            <CardContent className="p-6 md:p-8 prose prose-invert prose-sm max-w-none">

              {/* §1 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§1 Scope and Overview</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.1 Services Covered</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms govern all use of SkyServer's services, including the Free Tier (a basic game server hosting service provided at no charge) and Paid Add-on services (enhancements such as additional RAM, CPU, storage, or game slots available for a fee). Both free and paid services are covered under this single set of Terms.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.2 Free vs. Paid Legal Structure</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Under Swiss law, the Free Tier is provided as a gratuitous service (a mandate provided without remuneration) and the Paid Add-ons constitute a paid service contract. This means that for the Free Tier, we offer the service free of charge as a courtesy without a payment obligation, whereas Paid Add-ons create a contractual payment relationship. No purchase is necessary to use the basic Free Tier, but if you choose to buy Add-ons, the additional terms for payments apply.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.3 Acceptance of Terms</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By using any part of the service – free or paid – you confirm that you accept these Terms. If you create an account or click "Agree" to these Terms, that action forms a binding agreement. These Terms also incorporate any Acceptable Use Policy (AUP) and Privacy provisions referenced herein. Users are responsible for ensuring that any persons they allow to use their SkyServer (e.g. game participants) also abide by relevant sections of these Terms.
                </p>
              </section>

              {/* §2 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§2 Description of Services and Account Terms</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.1 Free Tier (Gratuitous Service)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  SkyServer's Free Tier provides basic game server hosting at no charge. This service is offered "as is" as a courtesy to users. Because it is free, it is considered a mandate without remuneration under the Swiss Code of Obligations. There is no guarantee of continued availability or performance for free services – the Provider may modify, limit, or discontinue the Free Tier (or any part of it) at any time at its discretion. The User has no ownership or vested rights in a free server, and the Provider's obligations are limited to what is mandated by law for gratuitous services.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.2 Paid Add-ons (Subscription Services)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  SkyServer also offers optional Paid Add-on services for a fee. These include additional server resources such as increased RAM, CPU capacity, extra storage, more game slots, or other premium features. When you purchase a Paid Add-on, you enter into a contract for digital services in exchange for payment. The Paid Add-ons are provided on a subscription basis (normally month-to-month) as described in §3. The Provider will use commercially reasonable efforts to deliver the Paid services as advertised, subject to the terms and limitations in this agreement.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.3 Account Registration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To use SkyServer (whether free or paid), you may need to create an account with accurate information. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. You must be of legal age (or have parental/guardian consent) to form this contract. You agree not to share your account with others and to abide by all technical usage limits. The Provider reserves the right to suspend or terminate accounts that are inactive for an extended period or that violate these Terms.
                </p>
              </section>

              {/* §3 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§3 Fees, Billing, and Payment Terms</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.1 Pricing and Currency</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fees for Paid Add-ons are listed in Swiss Francs (CHF) and all charges will be processed in CHF. The prices are inclusive of all applicable taxes except that Swiss VAT is not charged at present, because the Provider's annual revenue is below the Swiss VAT registration threshold. Should the Provider's revenue exceed the threshold in the future or laws change, VAT may be applied; users will be informed accordingly. International users are responsible for any currency conversion fees or bank charges on their side.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.2 Subscription Model</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Paid Add-ons are sold on a subscription basis, typically month-to-month. When you subscribe to a Paid plan or feature, you will be billed in advance for each subscription period (e.g. monthly) at the beginning of that period. <strong className="text-foreground">Automatic Renewal:</strong> Your subscription will automatically renew at the end of each billing period for an additional period of the same length (e.g. one month), unless you cancel the subscription in accordance with §6. We will charge your chosen payment method for each renewal without further authorization, until you cancel.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.3 Payment Method</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Payments are handled via our third-party payment processor, Stripe, Inc. You must provide a valid payment method (e.g. credit or debit card) at the time of purchase. By subscribing to a Paid service, you authorize the Provider (and Stripe) to charge your provided payment method for the recurring subscription fees and any other applicable charges. It is your responsibility to ensure your payment information is accurate and up-to-date. All billing receipts will be sent electronically.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.4 Billing Cycle and Invoicing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The billing cycle for subscriptions is typically monthly from the date of purchase or activation of the service. For example, if you purchase an Add-on on the 15th of a month, your next billing date will be the 15th of the following month. We may align multiple add-on purchases to the same billing date for simplicity. You will receive an electronic invoice or receipt for each charge.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.5 Non-Payment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If a payment fails or is declined, we will notify you and may retry charging the payment method. If payment is not received within a reasonable time, the Provider reserves the right to suspend or downgrade your service until payment is made. Persistent non-payment may result in termination of the Paid service and conversion of your server to the Free Tier, if available, or deletion of your server data – see §7. You are responsible for any fees incurred due to late payment; the Provider will not be liable for such costs.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.6 No VAT Charges</h3>
                <p className="text-muted-foreground leading-relaxed">
                  As noted, we do not currently charge Swiss VAT on our services due to our small-business status below the VAT threshold. No separate VAT will be added to your bills. You will pay the listed subscription price. Businesses or individuals outside Switzerland are solely responsible for any indirect taxes or duties that may apply in their home jurisdiction.
                </p>
              </section>

              {/* §4 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§4 Provision of Services and Activation</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.1 Activation of Paid Services</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We endeavor to provision and activate any Paid Add-on services immediately after successful payment. In most cases, additional resources or features are enabled within minutes. However, we reserve the right to an activation window of up to 24 hours from the time of payment to fully activate or deliver a purchased digital service. This activation delay is a precaution to handle technical issues or manual verification if needed. You acknowledge that a short provisioning delay (up to 24 hours) is acceptable and does not entitle you to any refund or compensation.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.2 No Refund for Activation Delay</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Because the Paid Add-ons are digital services delivered online, once we begin to fulfill your order, you gain the benefit of the service. Even if activation takes some hours, you will still receive the full value of the subscription period from the time the service is activated. As such, no refund or cancellation may be claimed solely due to activation taking up to 24 hours.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.3 Service Delivery and Quality</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Provider will deliver the services digitally by enabling features on your game server account. There are no physical goods; the service is considered delivered when the features are activated on your account. The quality and performance of the service may vary based on network conditions, server load, and other factors. We will make reasonable efforts to ensure a good service, especially for paid users, but the Service Level is defined in §11 and subject to the disclaimers in §9.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.4 Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Basic customer support is available via email or online tickets, primarily in English. Free Tier users receive community-level or standard support when possible, while paid subscribers may receive priority or enhanced support. Support response times are not guaranteed, but we aim to address urgent Paid service issues as soon as feasible (typically within 24 hours).
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.5 Changes to Services</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Provider reserves the right to modify the features of the Free Tier or Paid plans over time. For Paid services, any material reduction in features or capacity will be communicated in advance and usually take effect in the next billing cycle unless required by law or security emergency. The Free Tier, being free and complimentary, can be changed or discontinued at any time without prior notice, as stated in §2.1.
                </p>
              </section>

              {/* §5 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§5 Consumer Right of Withdrawal (Waiver for Digital Services)</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.1 No "Cooling-Off" Period for Digital Delivery</h3>
                <p className="text-muted-foreground leading-relaxed">
                  SkyServer's Paid Add-ons are digital services delivered immediately or within a short time after purchase, upon your request. If you are a consumer residing in a country that provides a statutory "cooling-off" or right of withdrawal for online purchases, you acknowledge and agree that this right is waived once the service is fully delivered or activated at your request.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.2 Express Consent to Early Performance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  At the time of checkout for any Paid service, you will be asked to confirm that you want the service to start immediately and that you understand this will waive any applicable withdrawal right. By completing the purchase, you are providing your express consent to us to start the service before any statutory withdrawal period would expire.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.3 Exceptions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If for some reason we do not start providing the service within the agreed timeframe, or if we materially fail to deliver the service, your statutory rights (if any) may still apply. This clause only affects the no-fault change-of-mind cancellation right during a cooling-off period. It does not affect your ability to terminate for breach or other causes under general law or under these Terms.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.4 Non-EU/Non-Consumer Users</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you are not an individual consumer, or if you are outside jurisdictions with such withdrawal rights, then this section may not apply to you. Business users or users in countries without mandatory withdrawal statutes have no such cooling-off period by default. All users, however, are still bound by the no-refund policies described elsewhere in these Terms once services are delivered.
                </p>
              </section>

              {/* §6 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§6 Term, Renewal, and Cancellation by User</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.1 Term of Services</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Free Tier services are provided on an ongoing basis with no fixed term (at-will usage, subject to termination as per §7). Paid subscriptions run on monthly terms by default. The initial term for a Paid Add-on begins when the service is activated and lasts until the end of the billing period. Thereafter, the subscription renews automatically each month (see §3.2) until canceled.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.2 User Cancellation Right</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may cancel a Paid subscription at any time via the account dashboard or by contacting us. "Cancellation" means that the service will not renew at the next billing cycle. To avoid being charged for the next period, you should cancel before your next billing date.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.3 Effect of Cancellation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you cancel, you will continue to have access to the Paid Add-on features until the end of the current paid term that you have already paid for. After that, the subscription will end and your service will either revert to the Free Tier (with reduced resources) or be closed, as applicable. No pro-rated refunds will be given for unused days in a monthly subscription that you chose to cancel early, except where required by law.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.4 Cancellation of Free Accounts</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you are using only the Free Tier and wish to stop, you may simply discontinue use of the service. There is no payment to cancel. We reserve the right to delete inactive free servers or accounts (with prior warning when feasible) to manage resources.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.5 Upgrades and Downgrades</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you upgrade to a higher plan or add new Paid features, those may either take effect immediately (with a pro-rated charge) or at the next billing cycle. If you downgrade at your request, the change will usually apply from the next billing cycle. We recommend contacting support or using provided tools to schedule downgrades to coincide with the end of your current term.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.6 Reactivation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you cancel a subscription but later wish to re-subscribe, you may do so by purchasing the Add-on again, subject to availability and the pricing at that time. We do not guarantee the exact same server IP, configuration, or capacity will be available if you re-subscribe later.
                </p>
              </section>

              {/* §7 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§7 Suspension and Termination by Provider</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.1 Termination of Free Tier</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Because the Free Tier is a free courtesy service, the Provider may terminate or suspend free accounts or servers at any time for any reason (or no specific reason), though we will try to give notice or explanation when practical. Users have no contractual guarantee of continued free service.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.2 Termination for Cause (Paid or Free)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Provider may suspend or terminate your access to the service (free or paid) immediately and without prior notice if you breach these Terms, including violation of the Acceptable Use Policy in §8 or non-payment under §3.5. Serious violations will result in swift termination.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.3 No Refunds</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You will not be entitled to any refund of fees already paid in case of termination for cause. Termination for cause is considered a result of your wrongful action, and fees are forfeited to cover administrative costs of handling the breach.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.4 Loss of Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upon termination, your game server may be shut down and all associated data may be deleted. The Provider is not responsible for maintaining or providing you a copy of this data after termination, except as required by law. It is your responsibility to back up any data you wish to keep.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.5 Ban from Service</h3>
                <p className="text-muted-foreground leading-relaxed">
                  In cases of severe abuse, we reserve the right to ban you from creating new accounts or using the service in the future. We may also report misconduct to appropriate authorities if it involves unlawful material or activities.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.6 Termination for Convenience by Provider</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Aside from termination for cause, the Provider retains the right to terminate the service at any time for any reason, with reasonable notice when feasible. If we terminate a Paid service for convenience and not due to any fault of yours, we will either continue to provide the service for the remaining paid term or refund any unused portion of the fees on a pro-rata basis, at our discretion.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.7 Survival of Terms</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Even after your service is terminated, certain sections of these Terms will remain in effect. In particular, provisions regarding liability, indemnification, data protection, governing law, and any accrued rights will survive termination.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.8 Restoration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If your account or service was suspended, we may, at our discretion, restore access once the issue is resolved. A reactivation fee may apply for reinstating terminated services, and restoration is not guaranteed if we have already erased data or reallocated resources.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.9 User Data on Termination</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upon any termination, the Provider may irreversibly delete your server data and configuration after a retention period (if any) in accordance with our data protection policy (§10). Refer to §10 for more information on data handling.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.10 No Liability for Termination</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, the Provider will not be liable for any losses or damages suffered by you due to the suspension, termination, or deletion of your account or server in accordance with these Terms. Your sole remedy in case of termination without cause by us is the pro-rated refund described above.
                </p>
              </section>

              {/* §8 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§8 Acceptable Use Policy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree to use SkyServer's services responsibly and lawfully. All users must adhere to this Acceptable Use Policy ("AUP"), which applies internationally regardless of your location. The following uses of the service are expressly prohibited:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-3 ml-4">
                  <li><strong className="text-foreground">Illegal Activities:</strong> You may not use the servers for any unlawful purposes or in violation of any applicable laws or regulations, including using the service to commit crimes, infringe intellectual property rights, or breach privacy/data protection laws.</li>
                  <li><strong className="text-foreground">Cryptocurrency Mining:</strong> The use of SkyServer resources for cryptocurrency mining or similar blockchain computations is strictly forbidden. We will immediately suspend any instance found running mining software.</li>
                  <li><strong className="text-foreground">Network Abuse (DDoS and Hacking):</strong> You must not engage in any network abuse, including initiating DDoS attacks, flooding, mail bombing, port scanning, vulnerability scanning, hacking, or penetration testing of third-party systems without authorization.</li>
                  <li><strong className="text-foreground">Malware and Malicious Code:</strong> You are prohibited from using our service to store, transmit, or distribute viruses, worms, trojans, ransomware, keyloggers, or any other malicious software. You also may not operate botnets from our service.</li>
                  <li><strong className="text-foreground">Pirated Software and Copyright Infringement:</strong> You may not host or share any pirated or unlicensed content, including cracked game server software, illicit copies of games or software, warez, or any content that infringes intellectual property rights.</li>
                  <li><strong className="text-foreground">Hate Speech and Harassment:</strong> Our service cannot be used to disseminate hateful, harassing, or discriminatory content. Servers propagating extremist ideologies, terrorist propaganda, or violent hate organizations will be shut down.</li>
                  <li><strong className="text-foreground">Other Prohibited Content:</strong> You may not host content that is obscene, pornographic (especially content involving minors), defamatory, or libelous. Any use for fraudulent schemes, phishing, or impersonation is strictly forbidden.</li>
                  <li><strong className="text-foreground">Resource Abuse:</strong> You must not use the service in a way that unreasonably interferes with the Provider's other customers or operations. We reserve the right to throttle or limit resource usage to ensure stability for all users.</li>
                  <li><strong className="text-foreground">Spam and Unauthorized Communications:</strong> Using the server to send unsolicited bulk messages (spam), conduct spam operations, or run mass advertising campaigns is not allowed.</li>
                  <li><strong className="text-foreground">Security and Integrity:</strong> You shall not attempt to circumvent or disable security features of SkyServer's infrastructure, including attempting to gain access to other users' servers or data.</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Enforcement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you engage in any prohibited activities, the Provider may take any action it deems appropriate, including immediate suspension or termination of your account, deletion of offending content, and banning you from the platform. In serious cases, we may report you to law enforcement. Termination for AUP violations will result in forfeiture of any fees paid and no refund will be given.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Monitoring and Investigations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Provider does not actively monitor all user content or server activity. However, we reserve the right to investigate suspected violations of the AUP. By using the service, you consent to such monitoring and audit to the extent necessary to ensure compliance with these Terms and applicable law.
                </p>
              </section>

              {/* §9 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§9 Disclaimers of Warranty; Limitation of Liability</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.1 No Warranties – "As Is" Service</h3>
                <p className="text-muted-foreground leading-relaxed">
                  SkyServer is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, the Provider disclaims all warranties and representations, express or implied, regarding the service, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the services will be uninterrupted, error-free, or meet your specific requirements. Use of the service is at your own risk.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.2 Liability Limitations</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  To the fullest extent permitted by applicable law, the Provider's liability to you is limited. Specifically:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong className="text-foreground">Exclusion of Certain Damages:</strong> The Provider shall not be liable for any indirect, incidental, consequential, special, punitive, or exemplary damages, including damages for lost profits, lost data, lost goodwill, loss of enjoyment, or cost of substitute services.</li>
                  <li><strong className="text-foreground">Slight/Ordinary Negligence:</strong> The Provider disclaims any liability for damages caused by slight or ordinary negligence, in accordance with Swiss law.</li>
                  <li><strong className="text-foreground">Paid vs Free:</strong> For Free Tier users, our liability is extremely limited. For Paid users, liability is capped to the amount you paid us in the last subscription period.</li>
                  <li><strong className="text-foreground">Force Majeure:</strong> The Provider shall not be liable for damage resulting from scheduled maintenance, unavoidable technical issues, user actions or misuse, third-party attacks, force majeure events, or data loss.</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.3 Consumer Rights & Intent/Gross Negligence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nothing in these Terms shall exclude or limit the Provider's liability for willful misconduct or gross negligence, or for any liability which cannot be excluded under applicable law. As a matter of Swiss law, any agreement to exclude liability for unlawful intent or gross negligence in advance is void.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.4 Indemnification</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify and hold harmless the Provider and its affiliates from any and all third-party claims, liabilities, damages, and expenses arising out of your use of the service, your violation of these Terms, or your infringement of any third-party rights. This indemnity survives termination of the agreement.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.5 No Liability for User Content</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Provider is not liable for any content that you or your users upload, create, or disseminate using SkyServer. This content is solely your responsibility.
                </p>
              </section>

              {/* §10 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§10 Data Protection and Privacy</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.1 Applicable Data Law</h3>
                <p className="text-muted-foreground leading-relaxed">
                  SkyServer is based in Switzerland. The collection and processing of personal data is primarily governed by the Swiss Federal Act on Data Protection (FADP/DSG, revised as of 2023). While the EU GDPR does not directly apply to us, Swiss data protection law is largely inspired by GDPR principles, and we strive to handle user data in a manner consistent with high international standards.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.2 Personal Data Collected</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By using the service, you agree that we may collect and process personal data including information you provide (name, email address, payment information) and technical data (IP addresses, logs of server usage, game server configuration data). We use this data to provide and improve the service, process payments, and communicate with you. We do not store full credit card numbers; payments are handled through Stripe.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.3 Use of Personal Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your personal data will be used to set up and maintain your account, enable the game hosting service, monitor for abuses, and comply with legal obligations. We will not sell or rent your personal information to third parties.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.4 Data Processors and International Transfers</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may use third-party service providers (sub-processors) to operate SkyServer, such as Stripe for payment processing and third-party data centers for hosting. When personal data is transferred outside of Switzerland, we will ensure it's protected under adequate safeguards.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.5 Data Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We implement reasonable technical and organizational measures to protect personal data against unauthorized access, alteration, disclosure, or destruction. However, no system is perfectly secure. You are responsible for maintaining the security of your account.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.6 User Rights</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Under Swiss law (and if applicable, GDPR), users have certain rights regarding their personal data, including the right to access, correct, delete, and object to certain processing. You can request a copy of personal data we hold about you by contacting us. You may also request deletion of your account and personal data, subject to legal retention obligations.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.7 Disclosure of Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We will not disclose personal data to third parties except: (a) to our service providers as needed, (b) if required by law or in response to a valid legal demand, (c) to enforce our rights, or (d) with your explicit consent.
                </p>
              </section>

              {/* §11 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§11 Service Level and Uptime (SLA)</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">11.1 Best-Effort Basis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The SkyServer service (especially the Free Tier) is provided on a best-effort basis with no guaranteed uptime. We aim for high availability, but the Free Tier comes with no Service Level Agreement (SLA) or uptime guarantee. Paid users can expect a higher priority in uptime and support.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">11.2 Downtime and Credits</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If an SLA is in place and the service falls below the promised levels, the SLA will typically specify a remedy, such as service credits. Such credits will be your sole and exclusive remedy for downtime or service shortfall. We will not provide cash refunds for SLA violations, only credits.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">11.3 Service Continuity</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We aim to keep the service running 24/7 and have monitoring in place. Paid servers may be located on more reliable infrastructure with redundancy. Periodic maintenance is necessary and we will try to schedule it during low-usage hours. Emergency maintenance may occur without notice.
                </p>
              </section>

              {/* §12 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§12 Changes to Terms</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">12.1 Right to Modify</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Provider reserves the right to change or update these Terms of Service at any time. Any update will be prospective (forward-looking) from its effective date.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">12.2 Notification of Changes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When we make material changes, we will provide notice to users via the website, email, or the user dashboard. For significant changes, we will endeavor to give advance notice (e.g. 15 or 30 days) before the changes take effect.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">12.3 User Acceptance of Changes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you continue to use the service after the effective date of updated Terms, that will constitute your acceptance of the revised Terms. If you do not agree to the new Terms, you must stop using the service and cancel any subscriptions before the new Terms apply.
                </p>
              </section>

              {/* §13 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§13 General Provisions</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">13.1 Governing Law</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This Agreement shall be governed by and construed in accordance with the laws of Switzerland, specifically the Swiss Code of Obligations and other applicable Swiss federal laws, excluding conflict-of-law provisions.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">13.2 Jurisdiction</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the competent courts in Switzerland at the Provider's domicile.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">13.3 Severability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If any provision of these Terms is held to be invalid, illegal, or unenforceable, that provision shall be severed to the minimum extent necessary. The remaining provisions will remain in full force and effect. The parties agree to replace any invalid provision with one that closely reflects the original intent.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">13.4 No Waiver</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No waiver by the Provider of any breach shall be deemed a waiver of any preceding or subsequent breach. Any waiver must be in writing and signed by the Provider.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">13.5 Entire Agreement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms (including documents incorporated by reference, such as the Acceptable Use Policy and Privacy Policy) constitute the entire agreement between you and SkyServer regarding the use of the service, and supersede all prior agreements.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">13.6 Language</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms are provided in English. If we provide a translation in another language, it is for convenience, and the English version will prevail in case of conflict.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">13.7 Acknowledgment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By using the service, you acknowledge that you have read and understood these Terms, and that you agree to be bound by them. If you have any questions, please contact SkyServer support before using the service.
                </p>
              </section>

              {/* Footer note */}
              <div className="mt-12 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Last updated: February 2026 • SkyServer – A student project based in Switzerland
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

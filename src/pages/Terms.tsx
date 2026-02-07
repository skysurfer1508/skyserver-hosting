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
            <p className="mt-2 text-muted-foreground">Allgemeine Geschäftsbedingungen (AGB)</p>
          </div>

          {/* Legal Content */}
          <Card className="gaming-card border-border/50">
            <CardContent className="p-6 md:p-8 prose prose-invert prose-sm max-w-none">
              {/* Section 1 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§1. Scope and Nature of Service</h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.1 Free Service – No Rental Agreement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  SkyServer is a free-of-charge hosting service for game servers (e.g. Minecraft, Terraria, Satisfactory) operated as a student project. These Terms of Service (TOS) govern the use of the SkyServer service by registered users ("User") in relation to the service provider ("Provider"). The service is provided gratuitously as a courtesy or free mandate under Swiss law, and does not establish a rental (Mietvertrag) or lease agreement for server resources. Consequently, no contractual warranty (Gewährleistung) obligations apply as they would in a paid rental situation. The User has no entitlement to any specific service performance, availability or continued provision of SkyServer beyond what the Provider voluntarily offers. The service is provided "as is" without guarantees, and the Provider assumes no duty to maintain uptime or defect-free operation.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.2 No Consideration – No Payment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The use of SkyServer is entirely free for the User (a "Free Tier" service). No fees are charged, and no exchange of consideration occurs. Because the service is free, the legal relationship is characterized as an informal favor or gratuitous contract, not a commercial service contract. Provisions of Swiss contract law that presuppose payment or mutual exchange (e.g. lease or sales warranty rules) are not applicable to this service. The User acknowledges that the Provider offers SkyServer voluntarily and may discontinue or modify the service at any time (see §2 below), without the stringent obligations that would exist in a paid contractual arrangement.
                </p>
              </section>

              {/* Section 2 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§2. Right to Terminate or Suspend Service ("Kill-Switch")</h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.1 Provider's Discretion to Terminate</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Provider reserves the unconditional right to suspend or terminate the User's account, server instances, or any related services at any time, with immediate effect, and without prior notice or explanation. This "kill-switch" provision means the Provider can shut down servers or user accounts at will, for any or no reason. Such termination can include permanent deletion of all User data on the service. The User has no right or claim to continued use of the service, or to the restoration of terminated accounts or deleted data. In agreeing to these Terms, the User expressly accepts that the service may be discontinued or their access revoked at any moment, even absent cause.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.2 No Compensation or Liability for Termination</h3>
                <p className="text-muted-foreground leading-relaxed">
                  In the event of suspension or termination, the Provider shall not be liable for any losses or damages incurred by the User due to the interruption or cessation of service. The User will not be entitled to any compensation, reimbursement, or damages for the loss of access, data, or functionality resulting from the Provider's exercise of this right. The User is advised not to rely on the continued availability of the free service and to maintain independent backups of any important data (see §3 below). By using SkyServer, the User waives any legal claims against the Provider arising from an unannounced or discretionary termination of the free service.
                </p>
              </section>

              {/* Section 3 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§3. User Data and Backups; Risk of Data Loss</h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.1 User's Responsibility for Backups</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The User is solely responsible for maintaining current backups of any data, content, game progress, configurations, or other files uploaded to or created on the SkyServer service. The Provider does not guarantee that any backup of User data will be made on the server side, nor that any such backup (if made) will be available or up-to-date. System-side backups, if they exist, are not guaranteed and the User cannot claim restoration from them. The User is expected to regularly save and archive their own data (such as world saves, game files, settings) on personal storage outside of SkyServer.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.2 No Liability for Data Loss</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Provider assumes no liability for loss of data. By using the service, the User accepts that all data stored on SkyServer may be lost or irretrievably deleted at any time, especially in cases of service termination (per §2) or technical failure. The Provider gives no warranty for the preservation or recoverability of User data. In particular, the Provider is not liable for any damage or harm resulting from data loss, corrupted files, failed backups or restorations, regardless of the cause. This exclusion applies to loss caused by the Provider's deletion of servers or accounts, hardware or software failures, attacks, or any other circumstance. Users should not rely on SkyServer as the sole storage for any important data. All data stored on the service is at the User's own risk, and the User will have no claim against the Provider in case of permanent data loss.
                </p>
              </section>

              {/* Section 4 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§4. Liability and Warranty Disclaimer</h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.1 General Disclaimer</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To the fullest extent permitted by law, the Provider's liability is excluded or limited for any damages arising from or in connection with the use of SkyServer. SkyServer is provided "as is" with no warranties of any kind, whether express or implied. The Provider disclaims all warranties and representations regarding quality, performance, availability, or fitness for a particular purpose of the service. In particular, the Provider does not warrant that the service will be uninterrupted, error-free, secure, or that it will meet the User's expectations. The User bears all risk related to the use of the free service.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.2 Exclusion of Liability for Negligence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  In accordance with Article 100 of the Swiss Code of Obligations, any pre-agreement to exclude liability for unlawful intent or gross negligence is void, but it is permissible to exclude liability for slight (ordinary) negligence. Therefore, the Provider shall not be liable for damage caused by simple or ordinary negligence. The Provider's liability is only retained for damage caused by gross negligence or willful misconduct, to the extent such liability cannot be disclaimed under mandatory law. By using this free service, the User accepts that minor faults or lapses by the Provider will not give rise to any claims against the Provider.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.3 Specific Liability Exclusions</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Without limiting the generality of the above, the Provider shall not be liable for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong className="text-foreground">Downtime or Service Unavailability:</strong> Any unavailability of the service, interruptions, delays, or downtime. The User has no guarantee of continuous service and cannot claim damages for lost access or delayed gameplay.</li>
                  <li><strong className="text-foreground">Data Loss:</strong> Loss, deletion, or corruption of data (including game progress or configurations) stored on SkyServer. The Provider offers no compensation for data loss (see also §3.2).</li>
                  <li><strong className="text-foreground">Indirect or Consequential Damages:</strong> Any indirect, incidental, or consequential damages, including lost profits, lost expected savings, or loss of enjoyment or opportunities arising from the inability to use the service.</li>
                  <li><strong className="text-foreground">User's Own Materials or Third-Party Acts:</strong> Any damage arising from content or software uploaded by the User or from actions of other users or third parties (e.g. malware, hacking, or DDoS attacks affecting the service).</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This liability exclusion applies regardless of the legal theory of claim, whether contractual or non-contractual, except to the extent liability cannot be lawfully excluded or limited. Nothing in these Terms shall be construed to limit the Provider's liability for intentional misconduct or gross negligence as prohibited by law. In all cases, any residual mandatory liability that cannot be disclaimed (e.g. for personal injury caused by the Provider's fault, if applicable) is capped at the minimum level allowed by law.
                </p>
              </section>

              {/* Section 5 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§5. Acceptable Use Policy (Prohibited Conduct)</h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.1 Lawful and Proper Use Only</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  The User agrees to use SkyServer only for legitimate, game-hosting purposes and in compliance with all applicable laws and these Terms. Any misuse of the service is strictly prohibited. In particular – but without limitation – the User must not use SkyServer to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong className="text-foreground">Launch Cyber Attacks:</strong> Initiate, participate in, or facilitate any form of network attack, intrusion, or malicious interference, including Denial-of-Service (DoS/DDoS) attacks or hacking attempts against any computers, networks, or services.</li>
                  <li><strong className="text-foreground">Mine Cryptocurrencies:</strong> Run programs or processes for cryptocurrency mining, "farming," or similar resource-intensive tasks on the servers. Such activities unfairly consume resources and are forbidden.</li>
                  <li><strong className="text-foreground">Distribute Malware or Illicit Software:</strong> Upload, store, host, or disseminate malicious software (viruses, worms, trojans) or engage in activities like botnet control, spreading malware, or any form of malware hosting or distribution.</li>
                  <li><strong className="text-foreground">Phishing or Fraud:</strong> Conduct phishing schemes, fraud, identity theft, scamming, or any deceptive practices. The service may not be used to collect personal data under false pretenses or to impersonate others.</li>
                  <li><strong className="text-foreground">Infringe Intellectual Property:</strong> Store, share, or facilitate access to copyright-infringing content or other material that violates intellectual property rights. This includes pirated software, unlicensed media (pirated games, films, music), or any content that the User has no right to use.</li>
                  <li><strong className="text-foreground">Host Illegal Content:</strong> Publish, transmit, or store any content that is illegal under Swiss law. This includes, for example, obscene or pornographic material (especially involving minors), extremist or hate content, depictions of excessive violence, or any content that would violate Swiss criminal statutes. Users must not use the server for any activities that could be deemed criminal or unlawful.</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.2 Enforcement and Consequences</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Provider reserves the right to monitor compliance with this Acceptable Use Policy to the extent permitted by law. If a User is found to be engaging in any prohibited conduct above (or otherwise using the service in a manner that is unlawful or jeopardizes the service or other users), the Provider may take immediate action, including suspension or termination of the User's servers or account (pursuant to §2). Prohibited content may be removed or disabled without prior notice. The Provider may also report any suspected illegal activities to law enforcement authorities if appropriate. The User shall indemnify and hold the Provider harmless from any losses or legal consequences resulting from the User's violation of this §5 or any law (including any third-party claims or governmental fines).
                </p>
              </section>

              {/* Section 6 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§6. Changes to the Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Provider reserves the right to modify or update these Terms of Service (AGB) at any time. Changes will typically be made to address new features, legal requirements, or operational needs. If the Terms are updated, the Provider will make the revised version available (for example, by posting it on the project website or user portal). It is the User's responsibility to review the Terms periodically for any changes. In case of a material change, the Provider may, at its discretion, notify users via the service or email, but is not obliged to individually inform each user. Continued use of SkyServer after changes to the Terms constitutes acceptance of the updated Terms. If a User does not agree with a change, their only recourse is to stop using the service and, if applicable, terminate their account. There is no specific entitlement for the User to be individually informed or to object to changes in these free service Terms (unlike paid contracts) – nonetheless, the Provider will ensure that the latest Terms are always accessible for review. The Provider may also make minor adjustments or corrections to these Terms without prior notice, with immediate effect.
                </p>
              </section>

              {/* Section 7 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§7. Severability Clause</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Should any provision of these Terms of Service be found invalid, illegal, or unenforceable, either in whole or in part, by a competent court or authority, the validity of the remaining provisions shall not be affected. In such an event, the invalid or unenforceable provision will be deemed replaced by a valid, enforceable provision that closely reflects the original economic intent and purpose of the invalid provision, to the extent permitted by law. The same applies in the event of any unintended gap ("lacunæ") in these Terms: an appropriate provision shall be deemed to exist that reflects what the parties would have agreed upon in good faith to achieve the same purpose, had they considered the gap. This Severability Clause ensures that these Terms remain effective even if one part is held to be imperfect.
                </p>
              </section>

              {/* Section 8 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">§8. Governing Law and Jurisdiction</h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.1 Governing Law</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms, and any disputes arising out of or in connection with them or the use of SkyServer, are governed exclusively by the laws of Switzerland, in particular the Swiss Code of Obligations (Obligationenrecht), excluding its conflict of law provisions. The application of the United Nations Convention on Contracts for the International Sale of Goods (CISG) is excluded (as this service is not a sale of goods). Users who access the service from outside Switzerland are responsible for compliance with any local laws, but the relationship between User and Provider remains subject to Swiss law.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.2 Jurisdiction</h3>
                <p className="text-muted-foreground leading-relaxed">
                  For any and all disputes or claims arising from the use of SkyServer or these Terms, the parties agree that the exclusive place of jurisdiction shall be the competent courts at the Provider's domicile in Switzerland, provided that such choice of forum is permitted. In other words, the User agrees to submit to the personal jurisdiction of the courts of the district where the Provider is resident in Switzerland for the resolution of any such disputes. This clause does not limit the Provider's right to seek interim or injunctive relief in any appropriate jurisdiction if necessary. By using the service, the User explicitly consents to Switzerland as the forum for legal disputes.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.3 Venue and Costs</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The legal venue being at the Provider's location means that any litigation, if it occurs, shall be brought to the courts in that locale. Each party will bear its own costs and attorney fees, except as provided by procedural law or awarded by the court. This section §8 applies regardless of the User's country of residence or use, to the maximum extent permissible.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.4 Final Provisions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Service constitute the entire agreement between the User and the Provider regarding the use of the SkyServer free hosting service, superseding any prior understandings. Any waiver of rights by the Provider must be explicit and in writing to be effective, and a failure to enforce a provision on one occasion does not constitute a waiver of the right to enforce it on another occasion. The section headings (e.g. "§1, §2, …") in this document are for convenience and have no legal effect. The Terms are made available in English for broad understandability; in case of any translation (including any German version if provided), the English text shall govern for interpretation.
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

package templates

import (
	"fmt"
)

var InviteEmailHTML = fmt.Sprintf(`
					<!DOCTYPE html>
					<html lang="en" style="height:100%%;">

					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>IEEE SB VAST - Account Activation</title>
					</head>

					<body
						style="margin:0; padding:0; height:100%%; min-height:100%%; background-color:%s; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
						<table role="presentation" width="100%%" height="100%%" cellpadding="0" cellspacing="0"
							style="background-color:%s; height:100%%; min-height:100%%; padding:40px 0;">
							<tr>
								<td align="center" valign="middle">
									<table role="presentation" width="480" cellpadding="0" cellspacing="0"
										style="background-color:%s; overflow:hidden;">


										<tr>
											<td style="padding:32px 40px 0 40px;">
												<span style="font-size:18px; font-weight:700; color:%s; letter-spacing:-0.02em;">IEEE SB
													VAST</span>
											</td>
										</tr>


										<tr>
											<td style="padding:24px 40px 0 40px;">
												<h1 style="margin:0; font-size:22px; line-height:1.3; color:%s; font-weight:600;">
													Login to your {{.Event}} dashboard
												</h1>
											</td>
										</tr>


										<tr>
											<td style="padding:12px 40px 0 40px;">
												<p style="margin:0; font-size:15px; line-height:1.6; color:%s;">
													Hello {{.Name}},<br><br>
													Thank you for registering for {{.Event}}! Your account has been created successfully.
													Click the button below to activate your account and access your personalized {{.Event}}
													dashboard where you can view schedules, updates, and more.
												</p>
											</td>
										</tr>


										<tr>
											<td align="center" style="padding:28px 40px 8px 40px;">
												<table role="presentation" cellpadding="0" cellspacing="0">
													<tr>
														<td align="center" style="background-color:%s;">
															<a href="{{.InviteLink}}" target="_blank"
																style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
																Login To Your Account
															</a>
														</td>
													</tr>
												</table>
											</td>
										</tr>


										<tr>
											<td style="padding:24px 40px 0 40px;">
												<table role="presentation" width="100%%" cellpadding="0" cellspacing="0"
													style="background-color:%s; border:1px solid %s;">
													<tr>
														<td style="padding:16px 20px;">
															<table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
																<tr>
																	<td style="font-size:13px; color:%s; padding-bottom:4px;">Email</td>
																</tr>
																<tr>
																	<td
																		style="font-size:14px; color:%s; font-weight:500; padding-bottom:12px;">
																		{{.Email}}</td>
																</tr>
																<tr>
																	<td style="font-size:13px; color:%s; padding-bottom:4px;">Password for
																		{{.Event}}</td>
																</tr>
																<tr>
																	<td
																		style="font-size:14px; color:%s; font-weight:500; font-family:'SF Mono', Consolas, monospace;">
																		{{.Password}}</td>
																</tr>
															</table>
														</td>
													</tr>
												</table>
											</td>
										</tr>


										<tr>
											<td style="padding:20px 40px 0 40px;">
												<p
													style="margin:8px 0 0 0; font-size:13px; line-height:1.6; color:%s; word-break:break-all;">
													{{.InviteLink}}
												</p>
											</td>
										</tr>


										<tr>
											<td style="padding:32px 40px 0 40px;">
												<hr style="border:none; border-top:1px solid %s; margin:0;">
											</td>
										</tr>


										<tr>
											<td style="padding:20px 40px 32px 40px;">
												<p style="margin:0; font-size:12px; line-height:1.6; color:%s;">
													If you have any questions, feel free to reach out to our support team.
												</p>
											</td>
										</tr>


										<tr>
											<td style="padding:32px 40px 0 40px;">
												<hr style="border:none; border-top:1px solid %s; margin:0;">
											</td>
										</tr>


										<tr>
											<td style="padding:20px 40px 32px 40px;">
												<p style="margin:0; font-size:12px; line-height:1.6; color:%s;">
													If you weren't expecting this email or did not register for {{.Event}}, you can safely
													ignore this message.
												</p>
											</td>
										</tr>


									</table>


									<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="margin-top:20px;">
										<tr>
											<td align="center">
												<p style="margin:0; font-size:12px; color:%s;">&copy; 2025 IEEE SB VAST. All rights
													reserved.</p>
											</td>
										</tr>
									</table>


								</td>
							</tr>
						</table>
					</body>

					</html>
        `,
	ColorBackground,
	ColorBackground,
	ColorCard,
	ColorTextPrimary,
	ColorTextPrimary,
	ColorTextBody,
	ColorAccent,
	ColorCredentialBg,
	ColorBorder,
	ColorTextMuted,
	ColorTextPrimary,
	ColorTextMuted,
	ColorTextPrimary,
	ColorTextMuted,
	ColorBorder,
	ColorTextFooter,
	ColorBorder,
	ColorTextFooter,
	ColorTextFooter,
)

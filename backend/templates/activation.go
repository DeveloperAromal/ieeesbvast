package templates

import (
	"fmt"
)

var ActivateEmailHTML = fmt.Sprintf(`
		<!DOCTYPE html>
		<html lang="en" style="height:100%%;">
		<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Activate your account</title>
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Kufam:wght@700&display=swap" rel="stylesheet">
		</head>
		<body style="margin:0; padding:0; height:100%%; min-height:100%%; background-color:%s; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
			<table role="presentation" width="100%%" height="100%%" cellpadding="0" cellspacing="0" style="background-color:%s; height:100%%; min-height:100%%; padding:40px 0;">
				<tr>
					<td align="center" valign="middle">
						<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:%s; overflow:hidden;">

							<tr>
								<td style="padding:32px 40px 0 40px;">
									<span style="font-family:'Kufam', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:18px; font-weight:700; color:%s; letter-spacing:-0.02em;">ieeesbvast</span>
								</td>
							</tr>

							<tr>
								<td style="padding:24px 40px 0 40px;">
									<h1 style="margin:0; font-size:22px; line-height:1.3; color:%s; font-weight:600;">
										Activate your account
									</h1>
								</td>
							</tr>

							<tr>
								<td style="padding:12px 40px 0 40px;">
									<p style="margin:0; font-size:15px; line-height:1.6; color:%s;">
										Hi {{.Name}}, welcome to ieeesbvast. Click below to activate your account and get started.
									</p>
								</td>
							</tr>

							<tr>
								<td align="center" style="padding:28px 40px 8px 40px;">
									<table role="presentation" cellpadding="0" cellspacing="0">
										<tr>
											<td align="center" style="background-color:%s;">
												<a href="{{.InviteLink}}" target="_blank" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
													Activate account
												</a>
											</td>
										</tr>
									</table>
								</td>
							</tr>

							<tr>
								<td style="padding:20px 40px 0 40px;">
									<p style="margin:0; font-size:13px; line-height:1.6; color:%s;">
										If the button above doesn't work, copy and paste this link into your browser:
									</p>
									<p style="margin:8px 0 0 0; font-size:13px; line-height:1.6; color:%s; word-break:break-all;">
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
										If you weren't expecting this email, you can safely ignore it.
									</p>
								</td>
							</tr>

						</table>

						<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="margin-top:20px;">
							<tr>
								<td align="center">
									<p style="margin:0; font-size:12px; color:%s;">&copy; 2025 ieeesbvast. All rights reserved.</p>
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
	ColorTextMuted,
	ColorTextPrimary,
	ColorBorder,
	ColorTextFooter,
	ColorTextFooter,
)

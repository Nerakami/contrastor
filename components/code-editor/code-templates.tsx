"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Palette, Newspaper } from "lucide-react"

interface CodeTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  html: string
  css: string
}

interface CodeTemplatesProps {
  onSelectTemplate: (template: CodeTemplate) => void
}

export function CodeTemplates({ onSelectTemplate }: CodeTemplatesProps) {
  const templates: CodeTemplate[] = [
    {
      id: "basic",
      name: "Basic Email",
      description: "Simple email template with header and content",
      icon: FileText,
      category: "Basic",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Basic Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="background-color: #3b82f6; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome to Our Newsletter</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Hello there!</h2>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">Thank you for subscribing to our newsletter. We're excited to share our latest updates with you.</p>
              
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #10b981; border-radius: 6px;">
                          <a href="#" style="display: block; padding: 15px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">Get Started</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">&copy; 2024 Your Company. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      css: `/* This template uses inline styles for maximum email client compatibility */`,
    },
    {
      id: "newsletter",
      name: "Newsletter",
      description: "Professional newsletter layout with sections",
      icon: Newspaper,
      category: "Newsletter",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Newsletter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <img src="/placeholder.svg?height=60&width=200" alt="Company Logo" style="max-height: 60px; margin-bottom: 20px;">
              <h1 style="margin: 0 0 10px 0; color: #ffffff; font-size: 32px; font-weight: 300;">Weekly Newsletter</h1>
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">Issue #42 - January 2024</p>
            </td>
          </tr>

          <!-- Featured Article -->
          <tr>
            <td style="padding: 40px 30px; border-bottom: 1px solid #e5e7eb;">
              <h2 style="margin: 0 0 20px 0; color: #3b82f6; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Featured Article</h2>
              <img src="/placeholder.svg?height=200&width=540" alt="Featured" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 24px;">The Future of Email Marketing</h3>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">Discover the latest trends and strategies that will shape email marketing in 2024...</p>
              <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 500;">Read More →</a>
            </td>
          </tr>

          <!-- Articles Grid -->
          <tr>
            <td style="padding: 30px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="48%" style="background-color: #f8fafc; padding: 20px; border-radius: 8px; vertical-align: top;">
                    <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">Quick Tips</h4>
                    <p style="margin: 0; color: #374151; font-size: 14px;">5 ways to improve your email open rates</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #f8fafc; padding: 20px; border-radius: 8px; vertical-align: top;">
                    <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">Case Study</h4>
                    <p style="margin: 0; color: #374151; font-size: 14px;">How Company X increased conversions by 150%</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 40px 30px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 15px;">Twitter</a>
                    <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 15px;">LinkedIn</a>
                    <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 15px;">Facebook</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px;">You received this email because you subscribed to our newsletter.</p>
                    <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 12px;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      css: `/* This template uses inline styles for maximum email client compatibility */`,
    },
    {
      id: "promotional",
      name: "Promotional",
      description: "Eye-catching promotional email with offers",
      icon: Palette,
      category: "Marketing",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flash Sale</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(45deg, #ff6b6b, #feca57); padding: 50px 30px; text-align: center;">
              <h1 style="margin: 0 0 15px 0; color: #ffffff; font-size: 42px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🎉 FLASH SALE</h1>
              <p style="margin: 0 0 25px 0; color: #ffffff; font-size: 28px; font-weight: bold;">Up to 50% OFF Everything!</p>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: rgba(255,255,255,0.2); padding: 15px 25px; border-radius: 25px;">
                    <span style="color: #ffffff; font-size: 16px; font-weight: bold;">Limited Time: 24 Hours Only</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Offers -->
          <tr>
            <td style="padding: 40px 30px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="48%" style="border: 2px solid #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; vertical-align: top;">
                    <img src="/placeholder.svg?height=150&width=150" alt="Product 1" style="width: 150px; height: 150px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">Premium Package</h3>
                    <p style="margin: 0; font-size: 18px;">
                      <span style="text-decoration: line-through; color: #9ca3af; margin-right: 10px;">$99</span>
                      <span style="color: #ef4444; font-weight: bold; font-size: 24px;">$49</span>
                    </p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="border: 2px solid #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; vertical-align: top;">
                    <img src="/placeholder.svg?height=150&width=150" alt="Product 2" style="width: 150px; height: 150px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">Starter Bundle</h3>
                    <p style="margin: 0; font-size: 18px;">
                      <span style="text-decoration: line-through; color: #9ca3af; margin-right: 10px;">$49</span>
                      <span style="color: #ef4444; font-weight: bold; font-size: 24px;">$24</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 0 30px 40px 30px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background: linear-gradient(45deg, #10b981, #059669); border-radius: 50px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
                    <a href="#" style="display: block; padding: 20px 40px; color: #ffffff; text-decoration: none; font-size: 20px; font-weight: bold;">SHOP NOW & SAVE BIG!</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 15px 0 0 0; color: #ef4444; font-weight: bold; font-size: 16px;">⏰ Sale ends in 23:45:12</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Free shipping on orders over $50</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">30-day money-back guarantee</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      css: `/* This template uses inline styles for maximum email client compatibility */`,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Email Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.map((template) => {
          const Icon = template.icon
          return (
            <div key={template.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => onSelectTemplate(template)}
              >
                Use Template
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

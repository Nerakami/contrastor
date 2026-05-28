"use client"

import { useState, useEffect, useRef } from "react"
import { useEmailBuilderStore } from "@/lib/email-builder/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Monitor, Smartphone } from "lucide-react"

interface PreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: string
}

export function PreviewModal({ open, onOpenChange, subject }: PreviewModalProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")
  const { sections, canvasWidth, canvasBackgroundColor } = useEmailBuilderStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const generateCompleteHTML = () => {
    const mobileStyles = generateMobileStyles()
    const contentHTML = renderContentHTML()

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || "Email Preview"}</title>
  ${mobileStyles}
</head>
<body style="margin: 0; padding: 0; background-color: ${canvasBackgroundColor};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${canvasBackgroundColor};">
    <tbody>
      <tr>
        <td align="center">
          <table width="${canvasWidth}" cellpadding="0" cellspacing="0" class="resize" style="background-color: ${canvasBackgroundColor};">
            <tbody>
              <tr>
                <td>
                  ${contentHTML}
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
    `
  }

  useEffect(() => {
    if (iframeRef.current && open) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(generateCompleteHTML())
        doc.close()
      }
    }
  }, [open, sections, canvasWidth, canvasBackgroundColor, viewMode])

  const generateMobileStyles = () => {
    let styles = `
      <style>
        @media only screen and (max-width: 480px) {
          /* Added resize class for responsive canvas width on mobile */
          .resize {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Hide elements on mobile */
          .hide-on-mobile {
            display: none !important;
            max-height: 0 !important;
            overflow: hidden !important;
            mso-hide: all !important;
          }
          
          /* Stack columns on mobile */
    `

    sections.forEach((section, sectionIndex) => {
      if (section.mobileColumnBehavior === "stack" && section.columns.length > 1) {
        section.columns.forEach((column, columnIndex) => {
          styles += `
          .mobile-stack-${sectionIndex} .mobile-column-${sectionIndex}-${columnIndex} {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          `
        })
      }
    })

    styles += `
        }
        
        @media only screen and (min-width: 481px) {
          /* Hide elements on desktop */
          .hide-on-desktop {
            display: none !important;
            max-height: 0 !important;
            overflow: hidden !important;
            mso-hide: all !important;
          }
        }
      </style>
    `
    return styles
  }

  const renderContentHTML = () => {
    return sections
      .map((section, sectionIndex) => {
        // Build class names for visibility
        const sectionClasses = [
          section.mobileColumnBehavior === "stack" ? `mobile-stack-${sectionIndex}` : "",
          section.hideOnMobile ? "hide-on-mobile" : "",
          section.hideOnDesktop ? "hide-on-desktop" : "",
        ]
          .filter(Boolean)
          .join(" ")

        const hasBackgroundImage = section.backgroundType === "image" && section.backgroundImage

        let backgroundSize = section.backgroundSize || "cover"
        if (section.backgroundSize === "custom") {
          backgroundSize = `${section.backgroundSizeWidth || "100%"} ${section.backgroundSizeHeight || "auto"}`
        }

        const tdStyleString = `
          padding: ${section.padding.top}px ${section.padding.right}px ${section.padding.bottom}px ${section.padding.left}px;
          ${hasBackgroundImage ? `background-image: url(${section.backgroundImage}); background-size: ${backgroundSize}; background-repeat: ${section.backgroundRepeat || "no-repeat"}; background-position: ${section.backgroundPosition || "center center"};` : ""}
        `

        let html = `
        <table width="100%" cellpadding="0" cellspacing="0" class="${sectionClasses}" style="background-color: ${section.backgroundColor};">
          <tbody>
            <tr>
              <td style="${tdStyleString}">
        `

        if (hasBackgroundImage) {
          html += `<!--[if gte mso 9]>
                    <v:image xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="border: 0; display: inline-block; width: ${canvasWidth}px; height: auto;" src="${section.backgroundImage}" />
                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="border: 0; display: inline-block; position: absolute; width: ${canvasWidth}px; height: auto;">
                      <v:fill opacity="0%" color="${section.backgroundColor}" />
                      <v:textbox inset="0,0,0,0">
                    <![endif]-->`
        }

        html += `
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr>
        `

        section.columns.forEach((column, columnIndex) => {
          const columnClasses = [
            section.mobileColumnBehavior === "stack" ? `mobile-column-${sectionIndex}-${columnIndex}` : "",
            column.hideOnMobile ? "hide-on-mobile" : "",
            column.hideOnDesktop ? "hide-on-desktop" : "",
          ]
            .filter(Boolean)
            .join(" ")

          html += `
                      <td width="${column.width}%" valign="${section.verticalAlign || "top"}" class="${columnClasses}" style="background-color: ${column.backgroundColor}; padding: ${column.padding.top}px ${column.padding.right}px ${column.padding.bottom}px ${column.padding.left}px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tbody>
          `

          column.content.forEach((content) => {
            switch (content.type) {
              case "text":
                html += `
                            <tr>
                              <td style="font-size: ${content.fontSize}px; font-family: ${content.fontFamily}; color: ${content.color}; line-height: ${content.lineHeight}; padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px; vertical-align: ${section.verticalAlign || "top"};" align="${content.textAlign}">
                                ${content.content.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')}
                              </td>
                            </tr>
                `
                break
              case "image":
                const widthStyle = content.widthUnit === "px" ? `${content.width}px` : `${content.width}%`
                const imgTag = `<img src="${content.src || "/placeholder.svg"}" alt="${content.alt}" style="width: ${widthStyle}; max-width: 100%; height: auto; display: block;" />`
                const finalImgHTML = content.link
                  ? `<a href="${content.link}" target="_blank" rel="noopener noreferrer" style="display: block;">${imgTag}</a>`
                  : imgTag

                html += `
                            <tr>
                              <td style="padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px; vertical-align: ${section.verticalAlign || "top"};" align="${content.align}">
                                ${finalImgHTML}
                              </td>
                            </tr>
                `
                break
              case "button":
                html += `
                            <tr>
                              <td style="padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px; vertical-align: ${section.verticalAlign || "top"};" align="${content.align}">
                                <a href="${content.href}" target="_blank" rel="noopener noreferrer" style="display: inline-block; color: ${content.color}; background-color: ${content.backgroundColor}; border-radius: ${content.borderRadius}px; padding: ${content.buttonPadding.top}px ${content.buttonPadding.right}px ${content.buttonPadding.bottom}px ${content.buttonPadding.left}px; text-decoration: none; font-size: ${content.fontSize}px;">
                                  ${content.text}
                                </a>
                              </td>
                            </tr>
                `
                break
              case "divider":
                html += `
                            <tr>
                              <td style="padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px; vertical-align: ${section.verticalAlign || "top"};">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td style="border-top: ${content.height}px solid ${content.color}; font-size: 0; line-height: 0;">
                                        &nbsp;
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                `
                break
            }
          })

          html += `
                          </tbody>
                        </table>
                      </td>
          `
        })

        html += `
                    </tr>
                  </tbody>
                </table>
        `

        if (hasBackgroundImage) {
          html += `<!--[if gte mso 9]>
                      </v:textbox>
                    </v:rect>
                    </v:image>
                    <![endif]-->`
        }

        html += `
              </td>
            </tr>
          </tbody>
        </table>
        `

        return html
      })
      .join("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] h-[100vh] w-[100vw] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Preview Email</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("desktop")}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={viewMode === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("mobile")}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="flex justify-center items-start p-8 min-h-full">
            {viewMode === "desktop" ? (
              <div className="w-full" style={{ maxWidth: "1400px" }}>
                <iframe
                  ref={iframeRef}
                  className="w-full shadow-lg bg-white"
                  style={{ minHeight: "600px", border: "none" }}
                  title="Email Preview"
                />
              </div>
            ) : (
              // Mobile frame remains the same
              <div className="relative">
                <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl" style={{ width: "375px" }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10" />
                  <div className="bg-white rounded-[2.5rem] overflow-hidden relative" style={{ height: "667px" }}>
                    <div className="bg-gray-100 px-6 py-2 flex items-center justify-between text-xs">
                      <span className="font-semibold">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-3 border border-gray-400 rounded-sm" />
                        <div className="w-1 h-3 bg-gray-400 rounded-sm" />
                      </div>
                    </div>
                    <div className="bg-white border-b px-4 py-3">
                      <div className="text-xs text-gray-500">From: Your Company</div>
                      <div className="font-semibold text-sm mt-1">{subject || "Email Subject"}</div>
                    </div>
                    <div className="h-[calc(667px-100px)] overflow-auto">
                      <iframe
                        ref={iframeRef}
                        className="w-full bg-white"
                        style={{ minHeight: "100%", border: "none" }}
                        title="Email Preview Mobile"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

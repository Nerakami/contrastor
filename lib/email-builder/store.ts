import { create } from "zustand"

export type ElementType = "section" | "column" | "text" | "image" | "button" | "divider"

export interface BaseElement {
  id: string
  type: ElementType
}

export interface TextElement extends BaseElement {
  type: "text"
  content: string
  fontSize: number
  fontFamily: string
  color: string
  lineHeight: number
  textAlign: "left" | "center" | "right"
  padding: { top: number; right: number; bottom: number; left: number }
}

export interface ImageElement extends BaseElement {
  type: "image"
  src: string
  alt: string
  width: number
  widthUnit: "%" | "px" // Added width unit toggle
  link: string // Added link support for images
  align: "left" | "center" | "right"
  padding: { top: number; right: number; bottom: number; left: number }
}

export interface ButtonElement extends BaseElement {
  type: "button"
  text: string
  href: string
  color: string
  backgroundColor: string
  borderRadius: number
  fontSize: number
  padding: { top: number; right: number; bottom: number; left: number }
  buttonPadding: { top: number; right: number; bottom: number; left: number }
  align: "left" | "center" | "right"
}

export interface DividerElement extends BaseElement {
  type: "divider"
  color: string
  height: number
  padding: { top: number; right: number; bottom: number; left: number }
}

export type ContentElement = TextElement | ImageElement | ButtonElement | DividerElement

export interface Column extends BaseElement {
  type: "column"
  width: number // percentage
  backgroundColor: string
  padding: { top: number; right: number; bottom: number; left: number }
  hideOnMobile: boolean
  hideOnDesktop: boolean
  content: ContentElement[]
}

export interface Section extends BaseElement {
  type: "section"
  backgroundColor: string
  backgroundType: "color" | "image"
  backgroundImage: string
  backgroundSize: "cover" | "contain" | "auto" | "custom"
  backgroundSizeWidth: string // for custom size (e.g., "100%", "600px")
  backgroundSizeHeight: string // for custom size (e.g., "auto", "300px")
  backgroundPosition: string // e.g., "center center", "left top"
  backgroundRepeat: "repeat" | "no-repeat" | "repeat-x" | "repeat-y"
  padding: { top: number; right: number; bottom: number; left: number }
  verticalAlign: "top" | "middle" | "bottom"
  mobileColumnBehavior: "stack" | "inline"
  hideOnMobile: boolean
  hideOnDesktop: boolean
  columns: Column[]
}

export interface EmailBuilderState {
  sections: Section[]
  selectedElementId: string | null
  canvasWidth: number
  canvasBackgroundColor: string

  // Actions
  addSection: (columnCount: number, index?: number) => void
  removeSection: (sectionId: string) => void
  moveSection: (fromIndex: number, toIndex: number) => void
  duplicateSection: (sectionId: string) => void
  addColumnToSection: (sectionId: string) => void

  addContent: (
    sectionId: string,
    columnId: string,
    contentType: Exclude<ElementType, "section" | "column">,
    index?: number,
  ) => void
  removeContent: (sectionId: string, columnId: string, contentId: string) => void
  moveContent: (sectionId: string, columnId: string, fromIndex: number, toIndex: number) => void
  duplicateContent: (sectionId: string, columnId: string, contentId: string) => void

  updateElement: (elementId: string, updates: Partial<any>) => void
  selectElement: (elementId: string | null) => void

  setCanvasWidth: (width: number) => void
  setCanvasBackgroundColor: (color: string) => void
  loadDesign: (design: { sections: Section[]; canvasWidth?: number; canvasBackgroundColor?: string }) => void
  reset: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const createDefaultText = (): TextElement => ({
  id: generateId(),
  type: "text",
  content: "Edit this text",
  fontSize: 16,
  fontFamily: "Arial, sans-serif",
  color: "#000000",
  lineHeight: 1.5,
  textAlign: "left",
  padding: { top: 10, right: 10, bottom: 10, left: 10 },
})

const createDefaultImage = (): ImageElement => ({
  id: generateId(),
  type: "image",
  src: "/placeholder.svg?height=200&width=400",
  alt: "Image",
  width: 100,
  widthUnit: "%", // Default to percentage
  link: "", // Empty link by default
  align: "center",
  padding: { top: 10, right: 10, bottom: 10, left: 10 },
})

const createDefaultButton = (): ButtonElement => ({
  id: generateId(),
  type: "button",
  text: "Click me",
  href: "#",
  color: "#ffffff",
  backgroundColor: "#007bff",
  borderRadius: 4,
  fontSize: 16,
  padding: { top: 10, right: 10, bottom: 10, left: 10 },
  buttonPadding: { top: 12, right: 24, bottom: 12, left: 24 },
  align: "center",
})

const createDefaultDivider = (): DividerElement => ({
  id: generateId(),
  type: "divider",
  color: "#e0e0e0",
  height: 1,
  padding: { top: 10, right: 0, bottom: 10, left: 0 },
})

const createColumn = (width: number): Column => ({
  id: generateId(),
  type: "column",
  width,
  backgroundColor: "transparent",
  padding: { top: 10, right: 10, bottom: 10, left: 10 },
  hideOnMobile: false,
  hideOnDesktop: false,
  content: [],
})

const createSection = (columnCount: number): Section => {
  const columnWidth = 100 / columnCount
  const columns = Array.from({ length: columnCount }, () => createColumn(columnWidth))

  return {
    id: generateId(),
    type: "section",
    backgroundColor: "transparent",
    backgroundType: "color",
    backgroundImage: "",
    backgroundSize: "cover",
    backgroundSizeWidth: "100%",
    backgroundSizeHeight: "auto",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    padding: { top: 20, right: 0, bottom: 20, left: 0 },
    verticalAlign: "top",
    mobileColumnBehavior: columnCount > 1 ? "stack" : "inline",
    hideOnMobile: false,
    hideOnDesktop: false,
    columns,
  }
}

export const useEmailBuilderStore = create<EmailBuilderState>((set, get) => ({
  sections: [],
  selectedElementId: null,
  canvasWidth: 600,
  canvasBackgroundColor: "#ffffff",

  addSection: (columnCount, index) => {
    const newSection = createSection(columnCount)
    set((state) => {
      const sections = [...state.sections]
      if (index !== undefined) {
        sections.splice(index, 0, newSection)
      } else {
        sections.push(newSection)
      }
      return { sections }
    })
  },

  removeSection: (sectionId) => {
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== sectionId),
      selectedElementId: state.selectedElementId === sectionId ? null : state.selectedElementId,
    }))
  },

  moveSection: (fromIndex, toIndex) => {
    set((state) => {
      const sections = [...state.sections]
      const [removed] = sections.splice(fromIndex, 1)
      sections.splice(toIndex, 0, removed)
      return { sections }
    })
  },

  duplicateSection: (sectionId) => {
    set((state) => {
      const sectionIndex = state.sections.findIndex((s) => s.id === sectionId)
      if (sectionIndex === -1) return state

      const sectionToDuplicate = state.sections[sectionIndex]

      // Deep clone the section with new IDs
      const duplicatedSection: Section = {
        ...sectionToDuplicate,
        id: generateId(),
        columns: sectionToDuplicate.columns.map((column) => ({
          ...column,
          id: generateId(),
          content: column.content.map((content) => ({
            ...content,
            id: generateId(),
          })),
        })),
      }

      const sections = [...state.sections]
      sections.splice(sectionIndex + 1, 0, duplicatedSection)
      return { sections }
    })
  },

  addColumnToSection: (sectionId) => {
    set((state) => {
      const sections = state.sections.map((section) => {
        if (section.id === sectionId) {
          const currentColumnCount = section.columns.length
          const newColumnCount = currentColumnCount + 1
          const newWidth = 100 / newColumnCount

          // Recalculate all column widths
          const updatedColumns = section.columns.map((column) => ({
            ...column,
            width: newWidth,
          }))

          // Add new column
          updatedColumns.push(createColumn(newWidth))

          return {
            ...section,
            columns: updatedColumns,
          }
        }
        return section
      })
      return { sections }
    })
  },

  addContent: (sectionId, columnId, contentType, index) => {
    let newContent: ContentElement

    switch (contentType) {
      case "text":
        newContent = createDefaultText()
        break
      case "image":
        newContent = createDefaultImage()
        break
      case "button":
        newContent = createDefaultButton()
        break
      case "divider":
        newContent = createDefaultDivider()
        break
      default:
        return
    }

    set((state) => {
      const sections = state.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            columns: section.columns.map((column) => {
              if (column.id === columnId) {
                const content = [...column.content]
                if (index !== undefined) {
                  content.splice(index, 0, newContent)
                } else {
                  content.push(newContent)
                }
                return { ...column, content }
              }
              return column
            }),
          }
        }
        return section
      })
      return { sections }
    })
  },

  removeContent: (sectionId, columnId, contentId) => {
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            columns: section.columns.map((column) => {
              if (column.id === columnId) {
                return {
                  ...column,
                  content: column.content.filter((c) => c.id !== contentId),
                }
              }
              return column
            }),
          }
        }
        return section
      }),
      selectedElementId: state.selectedElementId === contentId ? null : state.selectedElementId,
    }))
  },

  moveContent: (sectionId, columnId, fromIndex, toIndex) => {
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            columns: section.columns.map((column) => {
              if (column.id === columnId) {
                const content = [...column.content]
                const [removed] = content.splice(fromIndex, 1)
                content.splice(toIndex, 0, removed)
                return { ...column, content }
              }
              return column
            }),
          }
        }
        return section
      }),
    }))
  },

  duplicateContent: (sectionId, columnId, contentId) => {
    set((state) => {
      const sections = state.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            columns: section.columns.map((column) => {
              if (column.id === columnId) {
                const contentIndex = column.content.findIndex((c) => c.id === contentId)
                if (contentIndex === -1) return column

                const contentToDuplicate = column.content[contentIndex]
                const duplicatedContent = {
                  ...contentToDuplicate,
                  id: generateId(),
                }

                const content = [...column.content]
                content.splice(contentIndex + 1, 0, duplicatedContent)
                return { ...column, content }
              }
              return column
            }),
          }
        }
        return section
      })
      return { sections }
    })
  },

  updateElement: (elementId, updates) => {
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id === elementId) {
          return { ...section, ...updates }
        }

        return {
          ...section,
          columns: section.columns.map((column) => {
            if (column.id === elementId) {
              return { ...column, ...updates }
            }

            return {
              ...column,
              content: column.content.map((content) => {
                if (content.id === elementId) {
                  return { ...content, ...updates }
                }
                return content
              }),
            }
          }),
        }
      }),
    }))
  },

  selectElement: (elementId) => {
    set({ selectedElementId: elementId })
  },

  setCanvasWidth: (width) => {
    set({ canvasWidth: width })
  },

  setCanvasBackgroundColor: (color) => {
    set({ canvasBackgroundColor: color })
  },

  loadDesign: (design) => {
    set({
      sections: design.sections || [],
      selectedElementId: null,
      canvasWidth: design.canvasWidth || 600,
      canvasBackgroundColor: design.canvasBackgroundColor || "#ffffff",
    })
  },

  reset: () => {
    set({ sections: [], selectedElementId: null })
  },
}))

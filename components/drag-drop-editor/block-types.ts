export interface BaseBlock {
  id: string
  type: string
}

// Row block contains columns
export interface RowBlock extends BaseBlock {
  type: "row"
  columns: ColumnBlock[]
  style: {
    backgroundColor: string
    padding: number
  }
}

// Column block contains content blocks
export interface ColumnBlock extends BaseBlock {
  type: "column"
  width: number // percentage of row width
  blocks: ContentBlock[]
  style: {
    backgroundColor: string
    padding: number
    verticalAlign: "top" | "middle" | "bottom"
  }
}

// Content blocks that go inside columns
export interface TextBlock extends BaseBlock {
  type: "text"
  content: string
  style: {
    fontSize: number
    fontWeight: "normal" | "bold"
    fontFamily: string
    textAlign: "left" | "center" | "right"
    color: string
    backgroundColor: string
    padding: { top: number, right: number, bottom: number, left: number } | number
    lineHeight: number
  }
}

export interface ImageBlock extends BaseBlock {
  type: "image"
  src: string
  alt: string
  href?: string
  style: {
    width: string
    height: string
    textAlign: "left" | "center" | "right"
    padding: number
  }
}

export interface ButtonBlock extends BaseBlock {
  type: "button"
  text: string
  href: string
  style: {
    backgroundColor: string
    color: string
    padding: number
    borderRadius: number
    textAlign: "left" | "center" | "right"
    fontSize: number
    fontWeight: "normal" | "bold"
  }
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer"
  height: number
}

export interface DividerBlock extends BaseBlock {
  type: "divider"
  style: {
    color: string
    thickness: number
    padding: number
  }
}

export type ContentBlock = TextBlock | ImageBlock | ButtonBlock | SpacerBlock | DividerBlock
export type EmailBlock = RowBlock | ContentBlock

export interface EmailContent {
  blocks: EmailBlock[]
  style: {
    backgroundColor: string
    fontFamily: string
    maxWidth: number
  }
}

// Helper functions for creating blocks
export function createRowBlock(columnCount: number): RowBlock {
  const columnWidth = Math.floor(100 / columnCount)
  const columns: ColumnBlock[] = []

  for (let i = 0; i < columnCount; i++) {
    columns.push({
      id: `col-${Date.now()}-${i}`,
      type: "column",
      width: columnWidth,
      blocks: [],
      style: {
        backgroundColor: "transparent",
        padding: 10,
        verticalAlign: "top",
      },
    })
  }

  return {
    id: `row-${Date.now()}`,
    type: "row",
    columns,
    style: {
      backgroundColor: "transparent",
      padding: 0,
    },
  }
}

export function createTextBlock(): TextBlock {
  return {
    id: `text-${Date.now()}`,
    type: "text",
    content: "Enter your text here...",
    style: {
      fontSize: 16,
      fontWeight: "normal",
      fontFamily: "Arial",
      textAlign: "left",
      color: "#000000",
      backgroundColor: "transparent",
      padding: 10,
      lineHeight: 1.5,
    },
  }
}

export function createImageBlock(): ImageBlock {
  return {
    id: `img-${Date.now()}`,
    type: "image",
    src: "/placeholder.svg?height=200&width=400",
    alt: "Image",
    style: {
      width: "100%",
      height: "auto",
      textAlign: "center",
      padding: 10,
    },
  }
}

export function createButtonBlock(): ButtonBlock {
  return {
    id: `btn-${Date.now()}`,
    type: "button",
    text: "Click Here",
    href: "#",
    style: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      padding: 12,
      borderRadius: 6,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "bold",
    },
  }
}

export function createSpacerBlock(): SpacerBlock {
  return {
    id: `spacer-${Date.now()}`,
    type: "spacer",
    height: 20,
  }
}

export function createDividerBlock(): DividerBlock {
  return {
    id: `divider-${Date.now()}`,
    type: "divider",
    style: {
      color: "#e5e7eb",
      thickness: 1,
      padding: 20,
    },
  }
}

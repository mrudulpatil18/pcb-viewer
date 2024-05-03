import { Fragment, useState } from "react"
import { css } from "@emotion/css"
import {
  AnySoupElement,
  LayerRef,
  PCBTraceError,
  SourceError,
  all_layers,
} from "@tscircuit/builder"
import { LAYER_NAME_TO_COLOR } from "lib/Drawer"
import { useGlobalStore } from "global-store"

interface Props {
  children?: any
  elements?: AnySoupElement[]
}

export const LayerButton = ({
  name,
  selected,
  onClick,
}: {
  name: string
  selected?: boolean
  onClick: (e: any) => any
}) => {
  return (
    <div
      className={css`
        margin-top: 2px;
        padding: 4px;
        padding-left: 8px;
        padding-right: 18px;
        cursor: pointer;

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}
      onClick={onClick}
    >
      <span style={{ marginRight: 2, opacity: selected ? 1 : 0 }}>•</span>
      <span
        style={{
          marginLeft: 2,
          fontWeight: 500,
          color: (LAYER_NAME_TO_COLOR as any)[name.replace(/-/, "")],
        }}
      >
        {name}
      </span>
    </div>
  )
}

export const ToolbarButton = ({ children, ...props }: any) => (
  <div
    {...props}
    style={{
      backgroundColor: "#1F1F1F",
      border: "1px solid #666",
      margin: 4,
      padding: 4,
      paddingLeft: 6,
      paddingRight: 6,
      borderRadius: 2,
      alignSelf: "start",
      color: "#eee",
      cursor: "pointer",
      ...props.style,
    }}
  >
    {children}
  </div>
)

export const ToolbarOverlay = ({ children, elements }: Props) => {
  const [isMouseOverContainer, setIsMouseOverContainer] = useState(false)
  const [isLayerMenuOpen, setLayerMenuOpen] = useState(false)
  const [isErrorsOpen, setErrorsOpen] = useState(false)
  const [selectedLayer, selectLayer] = useGlobalStore(
    (s) => [s.selected_layer, s.selectLayer] as const
  )
  const [in_move_footprint_mode, in_draw_trace_mode] = useGlobalStore((s) => [
    s.in_move_footprint_mode,
    s.in_draw_trace_mode,
  ])
  const setEditMode = useGlobalStore((s) => s.setEditMode)

  const errorCount =
    elements?.filter((e) => e.type.includes("error")).length ?? 0

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => {
        setIsMouseOverContainer(true)
      }}
      onMouseLeave={(e) => {
        setIsMouseOverContainer(false)
        setLayerMenuOpen(false)
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          opacity: isMouseOverContainer ? 1 : 0,
          top: 16,
          left: 16,
          transition: isMouseOverContainer
            ? "opacity 100ms linear"
            : "opacity 1s linear",
          zIndex: 100,
          color: "red",
          display: "flex",
          fontSize: 12,
          height: 100,
          fontFamily: "sans-serif",
        }}
      >
        <ToolbarButton
          onClick={() => {
            setLayerMenuOpen(!isLayerMenuOpen)
          }}
          onMouseLeave={() => {
            if (isLayerMenuOpen) {
              setLayerMenuOpen(false)
            }
          }}
        >
          <div>
            layer:{" "}
            <span
              style={{
                marginLeft: 2,
                fontWeight: 500,
                color: (LAYER_NAME_TO_COLOR as any)[selectedLayer as string],
              }}
            >
              {selectedLayer as string}
            </span>
          </div>
          {isLayerMenuOpen && (
            <div style={{ marginTop: 4, minWidth: 120 }}>
              {all_layers
                .map((l) => l.replace(/-/g, "")) // TODO remove when inner-1 becomes inner1
                .map((layer) => (
                  <LayerButton
                    key={layer}
                    name={layer}
                    selected={layer === selectedLayer}
                    onClick={() => {
                      selectLayer(layer.replace(/-/, "") as LayerRef)
                    }}
                  />
                ))}
            </div>
          )}
        </ToolbarButton>
        <ToolbarButton
          style={errorCount > 0 ? { color: "red" } : {}}
          onClick={() => setErrorsOpen(!isErrorsOpen)}
          onMouseLeave={() => setErrorsOpen(false)}
        >
          <div>{errorCount} errors</div>
          {isErrorsOpen && (
            <div
              style={{ display: "grid", gridTemplateColumns: "100px 300px" }}
            >
              {elements
                ?.filter((e): e is PCBTraceError => e.type.includes("error"))
                .map((e, i) => (
                  <Fragment key={i}>
                    <div>{e.error_type}</div>
                    <div>{e.message}</div>
                  </Fragment>
                ))}
            </div>
          )}
        </ToolbarButton>
        <ToolbarButton
          style={{}}
          onClick={() => {
            setEditMode(in_draw_trace_mode ? "off" : "draw_trace")
          }}
        >
          <div>
            {in_draw_trace_mode ? "✖ " : ""}
            Edit Traces
          </div>
        </ToolbarButton>
        <ToolbarButton
          style={{}}
          onClick={() => {
            setEditMode(in_move_footprint_mode ? "off" : "move_footprint")
          }}
        >
          <div>
            {in_move_footprint_mode ? "✖ " : ""}
            Move Components
          </div>
        </ToolbarButton>
      </div>
    </div>
  )
}

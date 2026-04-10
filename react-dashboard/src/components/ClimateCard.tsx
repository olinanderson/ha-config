import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEntity } from '@/hooks/useEntity';
import { useService } from '@/hooks/useService';
import { cn } from '@/lib/utils';
import { Power, Flame, Minus, Plus } from 'lucide-react';

// ─── Horseshoe Arc constants ───
const CX = 140;
const CY = 140;
const R = 110;
const STROKE = 12;

// Arc spans from 135° to 405° (i.e. 135° clockwise through bottom to 45° on right)
const ARC_START_DEG = 135;
const ARC_END_DEG = 405;
const ARC_SPAN = ARC_END_DEG - ARC_START_DEG; // 270°

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

function polarToXY(deg: number) {
  const r = degToRad(deg);
  return { x: CX + R * Math.cos(r), y: CY + R * Math.sin(r) };
}

/** SVG arc path from startDeg to endDeg */
function arcPath(startDeg: number, endDeg: number) {
  const s = polarToXY(startDeg);
  const e = polarToXY(endDeg);
  const span = endDeg - startDeg;
  const large = span > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`;
}

/** Convert a temperature to an angle on the arc */
function tempToAngle(temp: number, min: number, max: number) {
  const ratio = Math.max(0, Math.min(1, (temp - min) / (max - min)));
  return ARC_START_DEG + ratio * ARC_SPAN;
}

function angleToTemp(angle: number, min: number, max: number, step: number) {
  const raw = min + ((angle - ARC_START_DEG) / ARC_SPAN) * (max - min);
  return Math.round(Math.max(min, Math.min(max, raw)) / step) * step;
}

// ─── Drag thumb on arc ───
function useArcDrag(
  svgRef: React.RefObject<SVGSVGElement | null>,
  min: number,
  max: number,
  step: number,
  onDrag: (temp: number) => void,
  onDragEnd: () => void,
) {
  const dragging = useRef(false);

  const getAngleFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const scaleX = 280 / rect.width; // viewBox is 280 wide
      const scaleY = 280 / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      let angle = (Math.atan2(y - CY, x - CX) * 180) / Math.PI;
      // Normalize: atan2 returns -180..180, we need 0..360 mapped to our arc range
      if (angle < 0) angle += 360;
      // Clamp to arc: our arc goes from 135 to 405 (i.e. 135 → 360 → 45)
      // Map 0..45 range to 360..405
      if (angle < 90) angle += 360;
      if (angle < ARC_START_DEG) angle = ARC_START_DEG;
      if (angle > ARC_END_DEG) angle = ARC_END_DEG;
      return angle;
    },
    [svgRef],
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragging.current) return;
      const angle = getAngleFromEvent(clientX, clientY);
      if (angle !== null) {
        onDrag(angleToTemp(angle, min, max, step));
      }
    },
    [getAngleFromEvent, min, max, step, onDrag],
  );

  const handleEnd = useCallback(() => {
    if (dragging.current) {
      dragging.current = false;
      onDragEnd();
    }
  }, [onDragEnd]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onUp = () => handleEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('touchcancel', onUp);
    };
  }, [handleMove, handleEnd]);

  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      dragging.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const angle = getAngleFromEvent(clientX, clientY);
      if (angle !== null) {
        onDrag(angleToTemp(angle, min, max, step));
      }
    },
    [getAngleFromEvent, min, max, step, onDrag],
  );

  return { startDrag };
}

// ─── Main Component ───

export function ClimateCard() {
  const thermostat = useEntity('climate.a32_pro_van_hydronic_heating_pid');
  const callService = useService();

  const [localTarget, setLocalTarget] = useState<number | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const commitTemp = useCallback(
    (temp: number) => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
      commitTimer.current = setTimeout(() => {
        callService('climate', 'set_temperature', { temperature: temp }, {
          entity_id: 'climate.a32_pro_van_hydronic_heating_pid',
        });
      }, 400);
    },
    [callService],
  );

  const targetTemp = thermostat?.attributes?.temperature ?? 0;
  const currentTemp: number = thermostat?.attributes?.current_temperature ?? 0;
  const minTemp: number = thermostat?.attributes?.min_temp ?? 5;
  const maxTemp: number = thermostat?.attributes?.max_temp ?? 35;
  const stepTemp: number = thermostat?.attributes?.target_temp_step ?? 0.1;
  const hvacMode = thermostat?.state ?? 'off';
  const isHeating = hvacMode === 'heat';
  const hvacAction = thermostat?.attributes?.hvac_action;
  const isActive = hvacAction === 'heating';

  const displayTarget = localTarget ?? targetTemp;

  // Clear local override when backend catches up
  useEffect(() => { setLocalTarget(null); }, [targetTemp]);

  const handleDrag = useCallback(
    (temp: number) => {
      setLocalTarget(temp);
      commitTemp(temp);
    },
    [commitTemp],
  );

  const handleDragEnd = useCallback(() => {
    // commit happens on drag already via debounce
  }, []);

  const { startDrag } = useArcDrag(svgRef, minTemp, maxTemp, stepTemp, handleDrag, handleDragEnd);

  const toggleMode = useCallback(() => {
    callService('climate', 'set_hvac_mode', {
      hvac_mode: isHeating ? 'off' : 'heat',
    }, { entity_id: 'climate.a32_pro_van_hydronic_heating_pid' });
  }, [callService, isHeating]);

  const adjustTemp = useCallback(
    (delta: number) => {
      const newTemp = Math.round(Math.max(minTemp, Math.min(maxTemp, displayTarget + delta)) / stepTemp) * stepTemp;
      setLocalTarget(newTemp);
      commitTemp(newTemp);
    },
    [displayTarget, minTemp, maxTemp, stepTemp, commitTemp],
  );

  if (!thermostat) return null;

  // Arc angles
  const targetAngle = tempToAngle(displayTarget, minTemp, maxTemp);
  const currentAngle = tempToAngle(currentTemp, minTemp, maxTemp);
  const thumbPos = polarToXY(targetAngle);

  // Colors
  const arcColor = isHeating
    ? isActive ? '#f97316' : '#f59e0b'
    : 'hsl(var(--muted))';
  const thumbColor = isHeating ? '#f97316' : 'hsl(var(--muted-foreground))';

  return (
    <Card>
      <CardContent className="pt-4 pb-4 px-2 flex flex-col items-center">
        {/* Three-dot menu area (top-right) */}
        <div className="w-full flex justify-end pr-2 -mt-1 mb-0">
          <button className="text-muted-foreground hover:text-foreground p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
        </div>

        {/* SVG horseshoe */}
        <svg
          ref={svgRef}
          viewBox="0 0 280 260"
          className="w-full max-w-[280px] select-none touch-none"
          style={{ marginTop: -8, marginBottom: -12 }}
        >
          {/* Background arc (track) */}
          <path
            d={arcPath(ARC_START_DEG, ARC_END_DEG)}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Filled arc up to target temp */}
          {isHeating && (
            <path
              d={arcPath(ARC_START_DEG, targetAngle)}
              fill="none"
              stroke={arcColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              className="transition-all duration-150"
            />
          )}

          {/* Current temperature tick */}
          {(() => {
            const tickInner = polarToXY(currentAngle);
            const outerR = R + STROKE / 2 + 4;
            const innerR = R - STROKE / 2 - 4;
            const outerPt = {
              x: CX + outerR * Math.cos(degToRad(currentAngle)),
              y: CY + outerR * Math.sin(degToRad(currentAngle)),
            };
            const innerPt = {
              x: CX + innerR * Math.cos(degToRad(currentAngle)),
              y: CY + innerR * Math.sin(degToRad(currentAngle)),
            };
            return (
              <line
                x1={innerPt.x} y1={innerPt.y}
                x2={outerPt.x} y2={outerPt.y}
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.5}
              />
            );
          })()}

          {/* Draggable thumb */}
          <circle
            cx={thumbPos.x}
            cy={thumbPos.y}
            r={isHeating ? 12 : 10}
            fill={thumbColor}
            stroke="white"
            strokeWidth={2}
            className={cn('cursor-grab active:cursor-grabbing', !isHeating && 'opacity-50')}
            onMouseDown={isHeating ? startDrag as any : undefined}
            onTouchStart={isHeating ? startDrag as any : undefined}
          />

          {/* Center: current temperature */}
          <text
            x={CX}
            y={CY - 6}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground"
            fontSize={42}
            fontWeight={300}
          >
            {currentTemp.toFixed(1)}
          </text>
          <text
            x={CX + 42}
            y={CY - 20}
            textAnchor="start"
            dominantBaseline="central"
            className="fill-muted-foreground"
            fontSize={16}
          >
            °C
          </text>

          {/* Target temp below current */}
          {isHeating && (
            <g>
              <line
                x1={CX - 30} y1={CY + 24}
                x2={CX + 30} y2={CY + 24}
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
              <text
                x={CX - 4}
                y={CY + 44}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground"
                fontSize={16}
              >
                {displayTarget.toFixed(1)}°C
              </text>
              {/* Heat waves icon */}
              <text
                x={CX + 32}
                y={CY + 44}
                textAnchor="start"
                dominantBaseline="central"
                fontSize={14}
                className={isActive ? 'fill-orange-500' : 'fill-muted-foreground'}
              >
                ≋
              </text>
            </g>
          )}
        </svg>

        {/* Buttons row: power + flame */}
        <div className="flex items-center gap-6 mt-1 mb-3">
          <button
            onClick={toggleMode}
            className={cn(
              'p-2.5 rounded-full border-2 transition-all',
              isHeating
                ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            <Power className="h-5 w-5" />
          </button>
          <button
            className={cn(
              'p-2.5 rounded-full border-2 transition-all',
              isActive
                ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                : 'border-border bg-card text-muted-foreground',
            )}
            disabled
          >
            <Flame className="h-5 w-5" />
          </button>
        </div>

        {/* Increment / decrement buttons */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => adjustTemp(-0.1)}
            disabled={!isHeating}
            className={cn(
              'p-3 rounded-full border-2 transition-all',
              isHeating
                ? 'border-border bg-card text-foreground hover:bg-accent active:scale-95'
                : 'border-border bg-card text-muted-foreground opacity-50',
            )}
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            onClick={() => adjustTemp(0.1)}
            disabled={!isHeating}
            className={cn(
              'p-3 rounded-full border-2 transition-all',
              isHeating
                ? 'border-border bg-card text-foreground hover:bg-accent active:scale-95'
                : 'border-border bg-card text-muted-foreground opacity-50',
            )}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

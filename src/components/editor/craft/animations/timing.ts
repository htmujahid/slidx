export type TimingProps = {
  begin: number
  dur: number
  repeatCount: number | "indefinite"
  fill: "freeze" | "remove"
}

export function timing(props: TimingProps) {
  return {
    begin: `${props.begin}s`,
    dur: `${props.dur}s`,
    repeatCount: props.repeatCount === 1 ? undefined : props.repeatCount,
    fill: props.fill,
  }
}

export const timingDefaults: TimingProps = {
  begin: 0,
  dur: 2,
  repeatCount: 1,
  fill: "freeze",
}

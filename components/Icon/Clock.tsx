import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function ClockIcon({
  size = 14,
  color = "#AB94FF",
}: Props) {
    return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <Path
        fill={color}
        fillRule="evenodd"
        d="M7 12.833A5.832 5.832 0 0 1 1.167 7 5.835 5.835 0 0 1 7 1.167 5.832 5.832 0 0 1 12.833 7 5.828 5.828 0 0 1 7 12.833Zm1.86-3.669a.433.433 0 0 0 .6-.152.44.44 0 0 0-.15-.6L7.233 7.175V4.48a.437.437 0 1 0-.875 0v2.946c0 .152.082.292.216.373l2.287 1.365Z"
        clipRule="evenodd"
        />
    </Svg>
    );
}
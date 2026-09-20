"use client";

import {
  FaDumbbell,
  FaHeartPulse,
  FaMoon,
  FaPersonBiking,
  FaPersonHiking,
  FaPersonRunning,
  FaPersonSkiingNordic,
  FaPersonSwimming,
  FaPersonWalking,
} from "react-icons/fa6";


type SportIconProps = {
  sport: string;
  size?: number;
};


export default function SportIcon({
  sport,
  size = 15,
}: SportIconProps) {

  const normalized =
    sport
      .trim()
      .toLowerCase();


  const iconProps = {
    className: "sportIcon",
    size,
    "aria-hidden":
      true as const,
  };


  if (
    normalized === "bike" ||
    normalized === "cycling"
  ) {
    return (
      <FaPersonBiking
        {...iconProps}
      />
    );
  }


  if (
    normalized === "run" ||
    normalized === "running"
  ) {
    return (
      <FaPersonRunning
        {...iconProps}
      />
    );
  }


  if (
    normalized === "swim" ||
    normalized === "swimming"
  ) {
    return (
      <FaPersonSwimming
        {...iconProps}
      />
    );
  }


  if (
    normalized === "strength" ||
    normalized === "gym"
  ) {
    return (
      <FaDumbbell
        {...iconProps}
      />
    );
  }


  if (
    normalized === "ski" ||
    normalized === "skiing" ||
    normalized.includes(
      "cross-country"
    )
  ) {
    return (
      <FaPersonSkiingNordic
        {...iconProps}
      />
    );
  }


  if (
    normalized === "hike" ||
    normalized === "hiking"
  ) {
    return (
      <FaPersonHiking
        {...iconProps}
      />
    );
  }


  if (
    normalized === "walk" ||
    normalized === "walking"
  ) {
    return (
      <FaPersonWalking
        {...iconProps}
      />
    );
  }


  if (
    normalized === "rest" ||
    normalized === "recovery"
  ) {
    return (
      <FaMoon
        {...iconProps}
      />
    );
  }


  /*
    Generic / manual activity.
    Same visual family as every named sport.
  */
  return (
    <FaHeartPulse
      {...iconProps}
    />
  );
}

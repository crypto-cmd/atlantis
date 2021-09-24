import React, { ReactElement, SyntheticEvent } from "react";
import classnames from "classnames";
import { IconColorNames } from "@jobber/design";
import styles from "./InternalChip.css";
import { ChipAvatar, ChipAvatarProps } from "./ChipAvatar";
import { ChipIcon, ChipIconProps } from "./ChipIcon";
import { useAssert } from "./useAssert";
import { ChipButtonProps, InternalChipButton } from "./InternalChipButton";
import { Typography } from "../Typography";

export interface InternalChipProps {
  /**
   * Label of the chip.
   */
  readonly label: string;

  /**
   * The HTML input's name.
   *
   * @link https://www.w3schools.com/tags/att_input_name.asp
   */
  readonly name?: string;

  /**
   * Throws a console warning when the chip label goes over 24 characters.
   */
  readonly warnOnLongLabels?: boolean;

  /**
   * Changes the style of the chip to look different than the default.
   */
  readonly active?: boolean;

  /**
   * Makes the chip look and feels uninteractable.
   */
  readonly disabled?: boolean;

  /**
   * Highlights the chip red.
   */
  readonly invalid?: boolean;

  /**
   * Determines whether to semantically act like a checkbox, radio, or button.
   */
  readonly type: "checkbox" | "radio" | "button";

  /**
   * Adds an avatar or icon on the left side of the label.
   *
   * **Example**
   *```jsx
   * <Chip prefix={<ChipAvatar initials="JBR" />} />
   * <Chip prefix={<ChipIcon name="quote" />} />
   * ```
   */
  readonly prefix?: ReactElement<ChipAvatarProps | ChipIconProps>;

  /**
   * Adds a component on the right side of the label.
   */
  readonly suffix?: ReactElement<ChipIconProps | ChipButtonProps>;

  /**
   * Callback when the chip itself gets clicked.
   */
  onClick?(event: SyntheticEvent): void;
}

export function InternalChip({
  label,
  active = false,
  disabled = false,
  invalid = false,
  prefix,
  suffix,
  warnOnLongLabels = false,
  name,
  type,
  onClick,
}: InternalChipProps) {
  const component = computedProps();
  assertProps();

  const className = classnames(styles.chip, {
    [styles.clickable]: component.isClickable,
    [styles.active]: active,
    [styles.disabled]: disabled,
    [styles.invalid]: invalid,
    [styles.hasPrefix]: prefix,
    [styles.hasSuffix]: suffix,
  });

  const Tag = chipTag();

  return (
    <Tag
      className={className}
      data-testid="chip-wrapper"
      {...(component.isTypeButton && {
        onClick: onClick,
        disabled: disabled,
        tabIndex: 0,
      })}
    >
      {component.isTypeInput && (
        <input
          type={type}
          checked={active}
          className={styles.input}
          name={name}
          onClick={onClick}
          onChange={() => {}} // No op. onClick handles the change to allow deselecting.
          disabled={disabled}
          data-testid="chip-input"
        />
      )}
      {renderPrefix()}
      <Typography size="base">{label}</Typography>
      {renderSuffix()}
    </Tag>
  );

  function chipTag() {
    if (component.isTypeButton) {
      if (onClick) return "button";
      return "div";
    }
    return "label";
  }

  function computedProps() {
    return {
      isPrefixAvatar: prefix?.type === ChipAvatar || false,
      isPrefixIcon: prefix?.type === ChipIcon || false,
      isSuffixIcon: suffix?.type === ChipIcon || false,
      isSuffixButton: suffix?.type === InternalChipButton || false,
      isClickable: onClick && !disabled,
      isTypeButton: type === "button",
      isTypeInput: type === "radio" || type === "checkbox",
    };
  }

  function renderPrefix() {
    if (component.isPrefixIcon) {
      return recolorChipIcon(prefix as ReactElement<ChipIconProps>);
    }
    return prefix;
  }

  function renderSuffix() {
    if (component.isSuffixIcon) {
      return recolorChipIcon(suffix as ReactElement<ChipIconProps>);
    }
    return suffix;
  }

  function recolorChipIcon(icon: ReactElement<ChipIconProps>) {
    let color: IconColorNames | undefined;
    active && (color = "white");
    invalid && !disabled && (color = "criticalOnSurface");
    disabled && !active && (color = "disabled");

    return (
      <div className={styles.icon}>
        {React.cloneElement(icon, { ...(color && { color: color }) })}
      </div>
    );
  }

  function assertProps() {
    useAssert(
      !!prefix && !(component.isPrefixAvatar || component.isPrefixIcon),
      `Prefix prop only accepts "<ChipAvatar />" or "<ChipIcon />" component. You have "${prefix?.type}".`,
    );
    useAssert(
      !!suffix && !(component.isSuffixIcon || component.isSuffixButton),
      `Prefix prop only accepts "<ChipIcon />" component. You have "${suffix?.type}".`,
    );
    useAssert(
      warnOnLongLabels && label.length > 24,
      `"${label}" label is too long for a Chip; you might be better off using Checkbox or Radio. ${label.length}/24 characters.`,
      { warn: true },
    );
  }
}

/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `create-snippet` command */
  export type CreateSnippet = ExtensionPreferences & {}
  /** Preferences accessible in the `create-env` command */
  export type CreateEnv = ExtensionPreferences & {}
  /** Preferences accessible in the `paste-snippet` command */
  export type PasteSnippet = ExtensionPreferences & {}
  /** Preferences accessible in the `history` command */
  export type History = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `create-snippet` command */
  export type CreateSnippet = {}
  /** Arguments passed to the `create-env` command */
  export type CreateEnv = {}
  /** Arguments passed to the `paste-snippet` command */
  export type PasteSnippet = {}
  /** Arguments passed to the `history` command */
  export type History = {}
}

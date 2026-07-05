/**
 * Shadows Design Tokens
 *
 * Defines elevation shadow styles to establish visual hierarchy,
 * depth, and overlay relationships (e.g., cards, tooltips, dropdowns, modals).
 */


// TODO: Define shadow tokens once approved
export { };


/**
 * ==========================================================
 * SHADOW DESIGN TOKENS
 * ----------------------------------------------------------
 * Không sử dụng box-shadow trực tiếp trong component.
 * Sử dụng key theo category dưới đây.
 * ==========================================================
 */


export const shadows = {
    none: "none",


    // -------------------------
    // Card / Panel Shadows
    // -------------------------
    cardLight: "0 2px 8px rgba(0, 0, 0, 0.06)",
    cardHover: "0 4px 12px rgba(0, 0, 0, 0.10)",
    cardActive: "0 6px 16px rgba(0, 0, 0, 0.14)",
    cardPressed: "0 4px 12px rgba(0, 0, 0, 0.10)",


    // -------------------------
    // Dropdown / Menu Shadows
    // -------------------------
    dropdownLight: "0 4px 12px rgba(0, 0, 0, 0.08)",
    dropdownHover: "0 6px 16px rgba(0, 0, 0, 0.12)",


    // -------------------------
    // Modal / Dialog Shadows
    // -------------------------
    modalLight: "0 8px 20px rgba(0, 0, 0, 0.10)",
    modalOverlay: "0 10px 30px rgba(0, 0, 0, 0.15)",


    // -------------------------
    // Tooltip / Popover Shadows
    // -------------------------
    tooltipLight: "0 2px 8px rgba(0, 0, 0, 0.08)",
    tooltipHover: "0 4px 12px rgba(0, 0, 0, 0.12)",


    // -------------------------
    // Button Shadows
    // -------------------------
    buttonLight: "0 2px 0 rgba(0, 0, 0, 0.02)",
    buttonHover: "0 4px 0 rgba(0, 0, 0, 0.04)",
    buttonActive: "0 2px 0 rgba(0, 0, 0, 0.02)",
    buttonPressed: "0 1px 0 rgba(0, 0, 0, 0.02)",


    // -------------------------
    // Overlay (Header/Footer/Sidebar) Shadows
    // -------------------------
    overlayLight: "0 -2px 8px rgba(0, 0, 0, 0.06)",
    overlayHover: "0 -4px 12px rgba(0, 0, 0, 0.10)",
    overlayActive: "0 -6px 16px rgba(0, 0, 0, 0.14)",


    // -------------------------
    // Google Maps Drop Shadows
    // -------------------------
    googleShadow1: "0 1px 2px rgba(0, 0, 0, 0.10)",
    googleShadow2: "0 4px 6px rgba(0, 0, 0, 0.12)",
    googleShadow3: "0 8px 12px rgba(0, 0, 0, 0.14)",
    googleShadow4: "0 16px 24px rgba(0, 0, 0, 0.16)",


    // -------------------------
    // Focus Rings
    // -------------------------
    focusRing: "0 0 0 3px rgba(24, 144, 255, 0.2)",


    // -------------------------
    // Elevation Levels (1-5)
    // -------------------------
    elevation1: "0 1px 2px rgba(0, 0, 0, 0.03)",
    elevation2: "0 2px 4px rgba(0, 0, 0, 0.05)",
    elevation3: "0 4px 6px rgba(0, 0, 0, 0.08)",
    elevation4: "0 8px 16px rgba(0, 0, 0, 0.10)",
    elevation5: "0 16px 32px rgba(0, 0, 0, 0.12)",
};


export default shadows;




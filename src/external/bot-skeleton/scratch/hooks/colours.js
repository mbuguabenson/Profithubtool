const lightMode = () => {
    const workspace = Blockly;
    // Updated Colors:
    // Root: Dark Navy (#082540) - User Requested
    // Logic (Special1): Soft Purple (#9575cd) - Customized
    // Base/Others: Official Grey (#e5e5e5) - Restored

    // RootBlock: Dark Navy
    const brandColor = '#082540';
    const brandColorSecondary = '#0a2e52';
    const brandColorTertiary = '#041525';

    workspace.Colours.RootBlock = {
        colour: brandColor,
        colourSecondary: brandColorSecondary,
        colourTertiary: brandColorTertiary,
    };

    // Base (Math, Text): Official Grey
    workspace.Colours.Base = {
        colour: '#e5e5e5',
        colourSecondary: '#ffffff',
        colourTertiary: '#6d7278',
    };

    // Logic: Official Grey (Restored per user request)
    workspace.Colours.Special1 = {
        colour: '#e5e5e5',
        colourSecondary: '#ffffff',
        colourTertiary: '#6d7278',
    };

    workspace.Colours.Special2 = {
        colour: '#e5e5e5',
        colourSecondary: '#ffffff',
        colourTertiary: '#6d7278',
    };

    workspace.Colours.Special3 = {
        colour: '#e5e5e5',
        colourSecondary: '#ffffff',
        colourTertiary: '#6d7278',
    };

    workspace.Colours.Special4 = {
        colour: '#e5e5e5',
        colourSecondary: '#000000',
        colourTertiary: '#0e0e0e',
    };
};

export const setColors = () => lightMode();

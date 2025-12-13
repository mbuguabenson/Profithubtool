import { Analytics, TEvents } from '@deriv-com/analytics';
import { ACTION, form_name } from './constants';

export const rudderStackSendDashboardClickEvent = ({
    dashboard_click_name,
    subpage_name,
}: TEvents['ce_bot_form'] & { dashboard_click_name: string }) => {
    Analytics.trackEvent('ce_bot_form', {
        action: ACTION.DASHBOARD_CLICK,
        form_name,
        subpage_name,
        dashboard_click_name,
    } as any);
};

export const rudderStackSendAnnouncementClickEvent = ({
    announcement_name,
}: TEvents['ce_bot_form'] & { announcement_name: string }) => {
    Analytics.trackEvent('ce_bot_form', {
        action: ACTION.ANNOUNCEMENT_CLICK,
        form_name,
        subform_name: 'announcements',
        subform_source: 'dashboard',
        announcement_name,
    } as any);
};

export const rudderStackSendAnnouncementActionEvent = ({
    announcement_action,
}: TEvents['ce_bot_form'] & { announcement_name: string; announcement_action: string }) => {
    Analytics.trackEvent('ce_bot_form', {
        action: ACTION.ANNOUNCEMENT_ACTION,
        form_name,
        subform_name: 'announcements',
        subform_source: 'dashboard',
        announcement_action,
    } as any);
};

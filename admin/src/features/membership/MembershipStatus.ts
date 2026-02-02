import { Membership } from '@prisma/client';

export type MembershipStatusType = 'invited' | 'active' | 'disabled';

export class MembershipStatus {
  static invited = 'invited' as const;
  static active = 'active' as const;
  static disabled = 'disabled' as const;

  static get asList() {
    return [this.active, this.invited, this.disabled];
  }

  static of(value?: Membership | null) {
    if (!value) {
      return MembershipStatus.disabled;
    }

    if (!value.roles?.length) {
      return MembershipStatus.disabled;
    }

    if (value.invitationToken) {
      return MembershipStatus.invited;
    }

    return MembershipStatus.active;
  }

  static isInvited(value?: Membership | null) {
    return this.of(value) === MembershipStatus.invited;
  }

  static isDisabled(value?: Membership | null) {
    return this.of(value) === MembershipStatus.disabled;
  }

  static isActive(value?: Membership | null) {
    return this.of(value) === MembershipStatus.active;
  }
}

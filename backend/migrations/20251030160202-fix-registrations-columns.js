'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Renombrar columnas de camelCase a snake_case para coincidir con underscored: true
    await queryInterface.renameColumn('registrations', 'registrationCode', 'registration_code');
    await queryInterface.renameColumn('registrations', 'eventId', 'event_id');
    await queryInterface.renameColumn('registrations', 'userId', 'user_id');
    await queryInterface.renameColumn('registrations', 'participantType', 'participant_type');
    await queryInterface.renameColumn('registrations', 'firstName', 'first_name');
    await queryInterface.renameColumn('registrations', 'lastName', 'last_name');
    await queryInterface.renameColumn('registrations', 'companyName', 'company_name');
    await queryInterface.renameColumn('registrations', 'basePrice', 'base_price');
    await queryInterface.renameColumn('registrations', 'discountAmount', 'discount_amount');
    await queryInterface.renameColumn('registrations', 'finalPrice', 'final_price');
    await queryInterface.renameColumn('registrations', 'paymentReference', 'payment_reference');
    await queryInterface.renameColumn('registrations', 'reservationExpiresAt', 'reservation_expires_at');
    await queryInterface.renameColumn('registrations', 'customFields', 'custom_fields');
    await queryInterface.renameColumn('registrations', 'groupRegistrationId', 'group_registration_id');
    await queryInterface.renameColumn('registrations', 'createdAt', 'created_at');
    await queryInterface.renameColumn('registrations', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('registrations', 'createdBy', 'created_by');
    await queryInterface.renameColumn('registrations', 'updatedBy', 'updated_by');
  },

  async down (queryInterface, Sequelize) {
    // Revertir los cambios - renombrar de snake_case a camelCase
    await queryInterface.renameColumn('registrations', 'registration_code', 'registrationCode');
    await queryInterface.renameColumn('registrations', 'event_id', 'eventId');
    await queryInterface.renameColumn('registrations', 'user_id', 'userId');
    await queryInterface.renameColumn('registrations', 'participant_type', 'participantType');
    await queryInterface.renameColumn('registrations', 'first_name', 'firstName');
    await queryInterface.renameColumn('registrations', 'last_name', 'lastName');
    await queryInterface.renameColumn('registrations', 'company_name', 'companyName');
    await queryInterface.renameColumn('registrations', 'base_price', 'basePrice');
    await queryInterface.renameColumn('registrations', 'discount_amount', 'discountAmount');
    await queryInterface.renameColumn('registrations', 'final_price', 'finalPrice');
    await queryInterface.renameColumn('registrations', 'payment_reference', 'paymentReference');
    await queryInterface.renameColumn('registrations', 'reservation_expires_at', 'reservationExpiresAt');
    await queryInterface.renameColumn('registrations', 'custom_fields', 'customFields');
    await queryInterface.renameColumn('registrations', 'group_registration_id', 'groupRegistrationId');
    await queryInterface.renameColumn('registrations', 'created_at', 'createdAt');
    await queryInterface.renameColumn('registrations', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('registrations', 'created_by', 'createdBy');
    await queryInterface.renameColumn('registrations', 'updated_by', 'updatedBy');
  }
};

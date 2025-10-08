'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Crear tabla hybrid_events
    await queryInterface.createTable('hybrid_events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      modality: {
        type: Sequelize.ENUM('presential', 'virtual', 'hybrid'),
        allowNull: false,
        defaultValue: 'hybrid'
      },
      presential_capacity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      virtual_capacity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      presential_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      virtual_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      streaming_platform: {
        type: Sequelize.ENUM('zoom', 'google_meet', 'microsoft_teams', 'custom_streaming'),
        allowNull: false
      },
      zoom_meeting_id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      zoom_meeting_password: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      zoom_join_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      zoom_start_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      google_meet_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      teams_meeting_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      custom_stream_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      custom_stream_key: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      recording_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      recording_retention_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      chat_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      qa_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      polls_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'America/Guatemala'
      },
      stream_delay_seconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Crear índices para hybrid_events
    await queryInterface.addIndex('hybrid_events', ['event_id'], {
      unique: true,
      where: { deleted_at: null }
    });
    await queryInterface.addIndex('hybrid_events', ['streaming_platform']);
    await queryInterface.addIndex('hybrid_events', ['is_active']);
    await queryInterface.addIndex('hybrid_events', ['created_by']);
    await queryInterface.addIndex('hybrid_events', ['created_at']);

    // Crear tabla streaming_configs
    await queryInterface.createTable('streaming_configs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hybrid_event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'hybrid_events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      session_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('idle', 'starting', 'active', 'stopping', 'stopped', 'error'),
        allowNull: false,
        defaultValue: 'idle'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Duración en segundos'
      },
      stream_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      viewer_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rtmp_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      hls_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      transcoding_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      recording_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      security_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      chat_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      qa_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      poll_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      analytics_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      cdn_config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Crear índices para streaming_configs
    await queryInterface.addIndex('streaming_configs', ['hybrid_event_id']);
    await queryInterface.addIndex('streaming_configs', ['session_id'], {
      unique: true,
      where: { session_id: { [Sequelize.Op.ne]: null } }
    });
    await queryInterface.addIndex('streaming_configs', ['status']);
    await queryInterface.addIndex('streaming_configs', ['is_active']);
    await queryInterface.addIndex('streaming_configs', ['start_time', 'end_time']);
    await queryInterface.addIndex('streaming_configs', ['created_by']);
    await queryInterface.addIndex('streaming_configs', ['created_at']);

    // Crear tabla virtual_rooms
    await queryInterface.createTable('virtual_rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hybrid_event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'hybrid_events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      platform: {
        type: Sequelize.ENUM('zoom', 'google_meet', 'microsoft_teams', 'custom_streaming'),
        allowNull: false
      },
      meeting_id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      meeting_password: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      join_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      start_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      stream_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      stream_key: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('inactive', 'active', 'full', 'closed'),
        allowNull: false,
        defaultValue: 'inactive'
      },
      moderators: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_private: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      password: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Crear índices para virtual_rooms
    await queryInterface.addIndex('virtual_rooms', ['hybrid_event_id']);
    await queryInterface.addIndex('virtual_rooms', ['status']);
    await queryInterface.addIndex('virtual_rooms', ['platform']);
    await queryInterface.addIndex('virtual_rooms', ['is_active']);
    await queryInterface.addIndex('virtual_rooms', ['start_time', 'end_time']);
    await queryInterface.addIndex('virtual_rooms', ['created_by']);
    await queryInterface.addIndex('virtual_rooms', ['created_at']);

    // Crear tabla virtual_participants
    await queryInterface.createTable('virtual_participants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hybrid_event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'hybrid_events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'virtual_rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      access_token: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('invited', 'joined', 'left', 'removed', 'blocked'),
        allowNull: false,
        defaultValue: 'invited'
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      left_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      total_time_connected: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Tiempo total conectado en segundos'
      },
      device_info: {
        type: Sequelize.JSON,
        allowNull: true
      },
      connection_quality: {
        type: Sequelize.JSON,
        allowNull: true
      },
      last_activity: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_moderator: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      can_chat: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      can_qa: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Crear índices para virtual_participants
    await queryInterface.addIndex('virtual_participants', ['hybrid_event_id', 'user_id'], {
      unique: true,
      where: { deleted_at: null }
    });
    await queryInterface.addIndex('virtual_participants', ['access_token'], {
      unique: true
    });
    await queryInterface.addIndex('virtual_participants', ['hybrid_event_id']);
    await queryInterface.addIndex('virtual_participants', ['user_id']);
    await queryInterface.addIndex('virtual_participants', ['room_id']);
    await queryInterface.addIndex('virtual_participants', ['status']);
    await queryInterface.addIndex('virtual_participants', ['joined_at']);
    await queryInterface.addIndex('virtual_participants', ['created_at']);
  },

  async down (queryInterface, Sequelize) {
    // Eliminar tablas en orden inverso
    await queryInterface.dropTable('virtual_participants');
    await queryInterface.dropTable('virtual_rooms');
    await queryInterface.dropTable('streaming_configs');
    await queryInterface.dropTable('hybrid_events');
  }
};

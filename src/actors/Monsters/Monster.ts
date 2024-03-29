import { generateMonsterAnimations } from "@/character-animations";
import { NetworkUpdater } from "@/classes/NetworkUpdater";
import {
  ANCHOR_CENTER,
  DOWN,
  Direction,
  EVENT_SEND_MONSTER_UPDATE,
  LEFT,
  PAIN,
  RIGHT,
  SCALE,
  SCALE_2x,
  TAG_ANY_PLAYER,
  TAG_DAMAGES_PLAYER,
  TAG_PLAYER_WEAPON,
  UP,
  WALK,
} from "@/constants";
import { guidGenerator, randomFromArray } from "@/helpers";
import {
  Actor,
  CollisionType,
  Engine,
  Shape,
  Vector,
  Animation,
} from "excalibur";
import { Explosion } from "../Explosion";

const MONSTER_WALK_VELOCITY = 30;
const MONSTER_CHASE_VELOCITY = 65;
const MONSTER_DETECT_PLAYER_RANGE = 150;

export class Monster extends Actor {
  networkId: string;
  roamingPoint?: Vector;
  target?: Actor;
  painState?: {
    msLeft: number;
    painVelX: number;
    painVelY: number;
  } | null;
  hp: number;
  facing: Direction;
  animations: {
    [key: string]: {
      [key: string]: Animation;
    };
  };
  networkUpdater?: NetworkUpdater;

  constructor(x: number, y: number) {
    super({
      pos: new Vector(x, y),
      width: 16,
      height: 16,
      scale: SCALE_2x,
      collider: Shape.Box(11, 10, ANCHOR_CENTER, new Vector(0, 4)),
      collisionType: CollisionType.Active,
    });

    this.networkId = guidGenerator();

    this.hp = 3;
    this.facing = DOWN;
    this.animations = generateMonsterAnimations();

    this.on("collisionstart", (event) => {
      this.onCollisionStart(event);
    });
  }

  onInitialize(engine: Engine): void {
    // Add to enemy group
    this.addTag(TAG_DAMAGES_PLAYER);

    // Choose a roaming point
    this.chooseRoamingPoint();

    void this.queryForTarget();

    this.networkUpdater = new NetworkUpdater(engine, EVENT_SEND_MONSTER_UPDATE);
  }

  createNetworkUpdateString() {
    const hasPainState = Boolean(this.painState);
    const x = Math.round(this.pos.x);
    const y = Math.round(this.pos.y);
    return `MONSTER|${this.networkId}|${x}|${y}|${this.vel.x}|${this.vel.y}|${this.facing}|${hasPainState}|${this.hp}`;
  }

  onCollisionStart(event: any) {
    if (event.other?.hasTag(TAG_PLAYER_WEAPON)) {
      if (event.other.isUsed) {
        return;
      }
      event.other.onDamagedSomething();
      this.takeDamage(event.other.direction);
    }
  }

  takeDamage(direction: Direction) {
    if (this.painState) {
      return;
    }

    // Reduce HP
    this.hp -= 1;

    // Check for death
    if (this.hp <= 0) {
      this.kill();
      const explosion = new Explosion(this.pos.x, this.pos.y);
      this.scene.engine.add(explosion);

      // Emit death event to network
      const networkUpdateString = this.createNetworkUpdateString();
      this.networkUpdater?.sendStateUpdate(networkUpdateString);

      return;
    }

    // Set pain state
    let x = this.vel.x * -1;
    if (direction === LEFT) {
      x = -300;
    }
    if (direction === RIGHT) {
      x = 300;
    }
    let y = this.vel.y * -1;
    if (direction === UP) {
      y = -300;
    }
    if (direction === DOWN) {
      y = 300;
    }

    this.painState = {
      msLeft: 100,
      painVelX: x,
      painVelY: y,
    };
  }

  async queryForTarget() {
    // If we don't have a valid target
    if (!this.target || this.target?.isKilled()) {
      // Query all players on the map
      const playersQuery = this.scene.world.queryManager.getQuery([
        TAG_ANY_PLAYER,
      ]);
      // Filter down to nearby ones within pixel range
      const actors = playersQuery.getEntities() as Actor[];
      const nearbyPlayers = actors.filter((actor) => {
        const actorDistance = this.pos.distance(actor.pos as Vector);
        return actorDistance < MONSTER_DETECT_PLAYER_RANGE;
      });
      // If we have results, choose one at random
      if (nearbyPlayers.length) {
        this.target = randomFromArray(nearbyPlayers);
      }
    }

    // Retry after x seconds
    await this.actions.delay(1500).toPromise();
    await this.queryForTarget();
  }

  chooseRoamingPoint() {
    const possibleRoamingSpots = [
      new Vector(84 * SCALE, 96 * SCALE),
      new Vector(210 * SCALE, 112 * SCALE),
      new Vector(95 * SCALE, 181 * SCALE),
      new Vector(224 * SCALE, 184 * SCALE),
    ];
    this.roamingPoint = randomFromArray(possibleRoamingSpots);
  }

  onPreUpdate(_engine: Engine, delta: number): void {
    // Handle pain state first
    if (this.painState) {
      this.vel.x = this.painState.painVelX;
      this.vel.y = this.painState.painVelY;
      this.painState.msLeft -= delta;
      if (this.painState.msLeft <= 0) {
        this.painState = null;
      }
    } else {
      // Pursue target or roam
      if (this.target) {
        this.onPreUpdateMoveTowardsTarget();
      } else {
        this.onPreUpdateMoveTowardsRoamingPoint();
      }
    }

    // Show the correct appearance
    this.onPreUpdateAnimation();

    // Update network
    const networkUpdateString = this.createNetworkUpdateString();
    this.networkUpdater?.sendStateUpdate(networkUpdateString);
  }

  onPreUpdateMoveTowardsRoamingPoint() {
    if (!this.roamingPoint) return;

    // Move towards the point if far enough away
    const distance = this.roamingPoint.distance(this.pos);
    if (distance > 5) {
      if (this.pos.x < this.roamingPoint.x) {
        this.vel.x = MONSTER_WALK_VELOCITY;
      }
      if (this.pos.x > this.roamingPoint.x) {
        this.vel.x = -MONSTER_WALK_VELOCITY;
      }
      if (this.pos.y < this.roamingPoint.y) {
        this.vel.y = MONSTER_WALK_VELOCITY;
      }
      if (this.pos.y > this.roamingPoint.y) {
        this.vel.y = -MONSTER_WALK_VELOCITY;
      }
    } else {
      this.chooseRoamingPoint();
    }
  }

  onPreUpdateMoveTowardsTarget() {
    // Move towards the target if far enough away
    const destination = this.target!.pos;
    const distance = destination.distance(this.pos);
    if (distance > 5) {
      if (this.pos.x < destination.x) {
        this.vel.x = MONSTER_CHASE_VELOCITY;
      }
      if (this.pos.x > destination.x) {
        this.vel.x = -MONSTER_CHASE_VELOCITY;
      }
      if (this.pos.y < destination.y) {
        this.vel.y = MONSTER_CHASE_VELOCITY;
      }
      if (this.pos.y > destination.y) {
        this.vel.y = -MONSTER_CHASE_VELOCITY;
      }
    }
  }

  faceTowardsPosition(pos: Vector) {
    const xDiff = Math.abs(this.pos.x - pos.x);
    const yDiff = Math.abs(this.pos.y - pos.y);

    // Use axis that has the greatest difference
    if (xDiff > yDiff) {
      if (this.pos.x < pos.x) {
        this.facing = this.pos.x > pos.x ? LEFT : RIGHT;
      } else {
        this.facing = this.pos.y > pos.y ? UP : DOWN;
      }
    }

    // Choose the correct frame
    const pose = this.painState ? PAIN : WALK;
    this.graphics.use(this.animations[pose][this.facing]);
  }

  onPreUpdateAnimation() {
    if (!this.target && !this.roamingPoint) return;

    const facePosition = this.target ? this.target.pos : this.roamingPoint!;
    this.faceTowardsPosition(facePosition);
  }
}

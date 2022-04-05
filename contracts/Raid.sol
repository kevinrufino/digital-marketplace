// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Raid is ERC1155, Ownable {

    using EnumerableSet for EnumerableSet.UintSet;
    uint256 public constant STAKE_LIMIT = 25;

    address public playerAddress;
    //User to raiding players
    mapping(address => EnumerableSet.UintSet) private raidingPlayers;
    //Staked Mouse to timestamp staked
    // mapping(uint256 => uint256) public miceStakeTimes;
    // mapping(uint256 => uint256) public miceClaimTimes;
    bool public isCheethSwapEnabled;

    constructor() ERC1155("") {
        isCheethSwapEnabled = true;
    }

    function raidPlayerByIds(uint256[] memory _playerIds) public {
        // require(
        //     _playerIds.length + raidingPlayers[msg.sender].length() <= STAKE_LIMIT,
        //     "Can only have a max of 25 raiding Player!"
        // );
        for (uint256 i = 0; i < _playerIds.length; i++) {
            _raidPlayer(_playerIds[i]);
        }
    }

    function returnPlayersByIds(uint256[] memory _playerIds) public {
        for (uint256 i = 0; i < _playerIds.length; i++) {
            _returnPlayer(_playerIds[i]);
        }
    }

    function claimRewardsByIds(uint256[] memory _playerIds) public {
        // this temporarily mints 1 of 5 items of a random id per player
        for (uint256 i = 0; i < _playerIds.length; i++) {
            uint256 thisPlayerId = _playerIds[i];
            require(
                raidingPlayers[msg.sender].contains(thisPlayerId),
                "Can only claim a player you staked!"
            );
            _mint(msg.sender, randMod(5), 1, "");
        }

        // uint256 runningCheethAllowance;
        // for (uint256 i = 0; i < _playerIds.length; i++) {
        //     uint256 thisMouseId = _playerIds[i];
        //     require(
        //         raidingPlayers[msg.sender].contains(thisMouseId),
        //         "Can only claim a player you staked!"
        //     );
        //     runningCheethAllowance += getCheethOwedToThisMouse(thisMouseId);

        //     playerClaimTimes[thisMouseId] = block.timestamp;
        // }
        // _mint(msg.sender, runningCheethAllowance);
    }

    function randMod(uint _modulus) internal returns(uint) {
        uint256 johnny = 4;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, johnny))) % _modulus;
    }

    function claimAllRewards() public {
        // this temporarily mints 1 of 5 items of a random id per player
        for (uint256 i = 0; i < raidingPlayers[msg.sender].length(); i++) {
            uint256 thisPlayerId = raidingPlayers[msg.sender].at(i);
            require(
                raidingPlayers[msg.sender].contains(thisPlayerId),
                "Can only claim a for player you raided!"
            );
            _mint(msg.sender, randMod(5), 1, "");
        }
        // uint256 runningCheethAllowance;

        // for (uint256 i = 0; i < raidingPlayers[msg.sender].length(); i++) {
        //     uint256 thisMouseId = raidingPlayers[msg.sender].at(i);
        //     runningCheethAllowance += getCheethOwedToThisMouse(thisMouseId);

        //     miceClaimTimes[thisMouseId] = block.timestamp;
        // }
        // _mint(msg.sender, runningCheethAllowance);
    }

    function returnAll() public {
        returnPlayersByIds(raidingPlayers[msg.sender].values());
    }

    function _raidPlayer(uint256 _playerId) internal onlyPlayerOwner(_playerId) {
        //Transfer their token
        IERC721Enumerable(playerAddress).transferFrom(
            msg.sender,
            address(this),
            _playerId
        );

        // Add the players to the owner's set
        raidingPlayers[msg.sender].add(_playerId);

        //Set this mouseId timestamp to now
        // miceStakeTimes[_mouseId] = block.timestamp;
        // miceClaimTimes[_mouseId] = 0;
    }

    function _returnPlayer(uint256 _playerId)
        internal
        onlyPlayerRaider(_playerId)
    {
        // uint256 cheethOwedToThisMouse = getCheethOwedToThisMouse(_playerId);
        // _mint(msg.sender, cheethOwedToThisMouse);

        IERC721(playerAddress).transferFrom(
            address(this),
            msg.sender,
            _playerId
        );

        raidingPlayers[msg.sender].remove(_playerId);
    }

    // GETTERS

    function playersRaiding(address _address)
        public
        view
        returns (uint256[] memory)
    {
        return raidingPlayers[_address].values();
    }

    function playersRaidingQuantity(address _address)
        public
        view
        returns (uint256)
    {
        return raidingPlayers[_address].length();
    }

    // function getCheethOwedToThisMouse(uint256 _mouseId)
    //     public
    //     view
    //     returns (uint256)
    // {
    //     uint256 elapsedTime = block.timestamp - miceStakeTimes[_mouseId];
    //     uint256 elapsedDays = elapsedTime < 1 days ? 0 : elapsedTime / 1 days;
    //     uint256 leftoverSeconds = elapsedTime - elapsedDays * 1 days;

    //     if (miceClaimTimes[_mouseId] == 0) {
    //         return _calculateCheeth(elapsedDays, leftoverSeconds);
    //     }

    //     uint256 elapsedTimeSinceClaim = miceClaimTimes[_mouseId] -
    //         miceStakeTimes[_mouseId];
    //     uint256 elapsedDaysSinceClaim = elapsedTimeSinceClaim < 1 days
    //         ? 0
    //         : elapsedTimeSinceClaim / 1 days;
    //     uint256 leftoverSecondsSinceClaim = elapsedTimeSinceClaim -
    //         elapsedDaysSinceClaim *
    //         1 days;

    //     return
    //         _calculateCheeth(elapsedDays, leftoverSeconds) -
    //         _calculateCheeth(elapsedDaysSinceClaim, leftoverSecondsSinceClaim);
    // }

    // function getTotalRewardsForUser(address _address)
    //     public
    //     view
    //     returns (uint256)
    // {
    //     uint256 runningCheethTotal;
    //     uint256[] memory miceIds = raidingPlayers[_address].values();
    //     for (uint256 i = 0; i < miceIds.length; i++) {
    //         runningCheethTotal += getCheethOwedToThisMouse(miceIds[i]);
    //     }
    //     return runningCheethTotal;
    // }

    //TODO recalculate for town econoy?
    // function getMouseCheethEmission(uint256 _mouseId)
    //     public
    //     view
    //     returns (uint256)
    // {
    //     uint256 elapsedTime = block.timestamp - miceStakeTimes[_mouseId];
    //     uint256 elapsedDays = elapsedTime < 1 days ? 0 : elapsedTime / 1 days;
    //     return _cheethDailyIncrement(elapsedDays);
    // }

    // function _calculateCheeth(uint256 _days, uint256 _leftoverSeconds)
    //     public
    //     pure
    //     returns (uint256)
    // {
    //     uint256 progressiveDays = Math.min(_days, 100);
    //     uint256 progressiveReward = progressiveDays == 0
    //         ? 0
    //         : (progressiveDays *
    //             (80.2 ether + 0.2 ether * (progressiveDays - 1) + 80.2 ether)) /
    //             2;

    //     uint256 dailyIncrement = _cheethDailyIncrement(_days);
    //     uint256 leftoverReward = _leftoverSeconds > 0
    //         ? (dailyIncrement * _leftoverSeconds) / 1 days
    //         : 0;

    //     if (_days <= 100) {
    //         return progressiveReward + leftoverReward;
    //     }
    //     return progressiveReward + (_days - 100) * 100 ether + leftoverReward;
    // }

    // function _cheethDailyIncrement(uint256 _days)
    //     public
    //     pure
    //     returns (uint256)
    // {
    //     return _days > 100 ? 100 ether : 80 ether + _days * 0.2 ether;
    // }

    // OWNER FUNCTIONS

    function setAddresses(address _playerAddress)
        public
        onlyOwner
    {
        playerAddress = _playerAddress;
    }

    // function setIsCheethSwapEnabled(bool _isCheethSwapEnabled)
    //     public
    //     onlyOwner
    // {
    //     isCheethSwapEnabled = _isCheethSwapEnabled;
    // }

    // MODIFIERS

    modifier onlyPlayerOwner(uint256 _playerId) {
        require(
            IERC721Enumerable(playerAddress).ownerOf(_playerId) == msg.sender,
            "Can only raid players you own!"
        );
        _;
    }

    modifier onlyPlayerRaider(uint256 _mouseId) {
        require(
            raidingPlayers[msg.sender].contains(_mouseId),
            "Can only return players you raided!"
        );
        _;
    }
}